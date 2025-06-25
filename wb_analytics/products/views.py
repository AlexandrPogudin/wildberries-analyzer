from django.shortcuts import render
import pandas as pd
import requests
import math
from sqlalchemy import create_engine
from rest_framework.views import APIView
from rest_framework.response import Response

def get_all_products_data(query, min_price=0, max_price=1e9, min_rating=0, max_rating=5, min_feedbacks=0, max_feedbacks=1e6):
    base_url = "https://search.wb.ru/exactmatch/ru/common/v4/search"
    headers = {"User-Agent": "Mozilla/5.0"}

    params = {
        "ab_testid": False,
        "appType": 1,
        "curr": "rub",
        "dest": -1664813,
        "query": query,
        "resultset": "catalog",
        "sort": "popular",
        "spp": 30,
        "page": 1
    }

    response = requests.get(base_url, params=params, headers=headers)
    first_page_data = response.json()

    if first_page_data["data"].get("total") == 0:
        return pd.DataFrame()

    total_pages = min(60, math.ceil(first_page_data["data"].get("total") / len(first_page_data["data"]["products"])))
    all_products = []

    for page in range(1, total_pages + 1):
        params["page"] = page
        try:
            response = requests.get(base_url, params=params, headers=headers)
            page_data = response.json()
            products = page_data["data"].get("products")
            for p in products:
                all_products.append({
                    "Артикул": p.get("id"),
                    "Название товара": p.get("name"),
                    "Цена": int(p.get("priceU") / 100),
                    "Цена со скидкой": int(p.get("salePriceU") / 100),
                    "Рейтинг": p.get("reviewRating"),
                    "Количество отзывов": p.get("feedbacks")
                })
        except Exception as e:
            print(f"Ошибка на странице {page}: {e}")

    df = pd.DataFrame(all_products)

    df = df[
        (df["Цена со скидкой"] >= min_price) &
        (df["Цена со скидкой"] <= max_price) &
        (df["Рейтинг"] >= min_rating) &
        (df["Рейтинг"] <= max_rating) &
        (df["Количество отзывов"] >= min_feedbacks) &
        (df["Количество отзывов"] <= max_feedbacks)
    ]

    engine = create_engine("sqlite:///products.db")
    df.to_sql("products", engine, if_exists="replace", index=False)
    return df



class ProductDataAPIView(APIView):
    def get(self, request):
        query = request.GET.get("query")
        if not query:
            return Response({"error": "query параметр обязателен"}, status=400)

        try:
            min_price = int(request.GET.get("min_price", 0))
            max_price = int(request.GET.get("max_price", 1e9))
            min_rating = float(request.GET.get("min_rating", 0))
            max_rating = float(request.GET.get("max_rating", 5))
            min_feedbacks = int(request.GET.get("min_feedbacks", 0))
            max_feedbacks = int(request.GET.get("max_feedbacks", 1e6))

            df = get_all_products_data(
                query=query,
                min_price=min_price,
                max_price=max_price,
                min_rating=min_rating,
                max_rating=max_rating,
                min_feedbacks=min_feedbacks,
                max_feedbacks=max_feedbacks,
            )

            return Response(df.to_dict(orient="records"))

        except Exception as e:
            return Response({"error": str(e)}, status=500)


def products_view(request):
    return render(request, 'products/products_page.html')