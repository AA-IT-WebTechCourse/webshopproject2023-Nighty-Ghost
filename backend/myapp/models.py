from django.db import models
from django.contrib.auth.models import User

class Item(models.Model):
    title = models.CharField(max_length=100,blank=False, null=False)
    description = models.TextField(blank=False, null=False)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    date_added = models.DateTimeField(auto_now_add=True)
    is_sold = models.BooleanField(default=False) 
    seller = models.ForeignKey(User, on_delete=models.CASCADE)
    img_upload = models.FileField(upload_to='item_images', blank=True, null=True)
    img_url = models.TextField(blank=True, null=True)


class CartModel(models.Model):
    added_by = models.ForeignKey(User, on_delete=models.CASCADE,null=False)
    added_item = models.ForeignKey(Item, on_delete=models.CASCADE,null=False)
    added_time = models.DateTimeField(auto_now_add=True)

class OrderItems(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    item = models.ForeignKey(Item, on_delete=models.CASCADE)
    quantity = models.PositiveIntegerField()
    purchase_time = models.DateTimeField(auto_now_add=True)
