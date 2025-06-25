from django.db import models

class Product(models.Model):
    article = models.BigIntegerField(unique=True)
    name = models.CharField(max_length=512)
    price = models.IntegerField()
    discount_price = models.IntegerField()
    rating = models.FloatField()
    feedbacks = models.IntegerField()

    def __str__(self):
        return self.name
