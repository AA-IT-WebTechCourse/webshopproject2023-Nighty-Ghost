from rest_framework import serializers
from .models import CartModel, Item
from django.contrib.auth.models import User

class CartSerializer(serializers.ModelSerializer):
    class Meta:
        model = CartModel
        fields = "__all__"

class EditSerializer(serializers.Serializer):
    new_password = serializers.CharField(required=True)
    password = serializers.CharField(required=True)

class MyItemsSerializer(serializers.Serializer):
    sold_filter = serializers.BooleanField(required=True)
    onsale_filter = serializers.BooleanField(required=True)
    purchased_filter = serializers.BooleanField(required=True)

class ItemSerializer(serializers.ModelSerializer):
    class Meta:
        model = Item
        fields = "__all__"


class RegisterSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("username", "email", "password")

class LoginSerializer(serializers.ModelSerializer):
    password = serializers.CharField(style = {"input_type":"password"})
    username = serializers.CharField()