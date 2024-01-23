# Generated by Django 4.2.7 on 2024-01-20 17:46

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('myapp', '0002_orderitems'),
    ]

    operations = [
        migrations.RemoveField(
            model_name='item',
            name='auto_add',
        ),
        migrations.AddField(
            model_name='cartmodel',
            name='added_item_price',
            field=models.CharField(default=0, max_length=100),
            preserve_default=False,
        ),
        migrations.AddField(
            model_name='item',
            name='img_upload',
            field=models.ImageField(blank=True, null=True, upload_to='item_images'),
        ),
    ]