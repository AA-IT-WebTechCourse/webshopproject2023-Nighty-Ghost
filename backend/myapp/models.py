from django.db import models
from django.contrib.auth.models import User


class Item(models.Model):
    title = models.CharField(max_length=100,blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    #category = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    #image = models.ImageField(upload_to='item_images', blank=True, null=True)
    img_url = models.TextField(blank=True, null=True)
    date_added = models.DateTimeField(auto_now_add=True)
    is_sold = models.BooleanField(default=False)
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    auto_add = models.BooleanField(default=False)


class CartModel(models.Model):
    color = models.CharField(max_length=30)
    created = models.DateTimeField(auto_now_add=True)
    updated = models.DateTimeField(auto_now=True)
    class Meta:
        ordering = ["created"]
