from django.conf import settings
from django.db import migrations, models
import django.db.models.deletion


def delete_ownerless_items(apps, schema_editor):
    Item = apps.get_model("api", "Item")
    Item.objects.filter(owner__isnull=True).delete()


class Migration(migrations.Migration):

    dependencies = [
        ("api", "0002_item_owner_nullable"),
        migrations.swappable_dependency(settings.AUTH_USER_MODEL),
    ]

    operations = [
        migrations.RunPython(
            delete_ownerless_items,
            reverse_code=migrations.RunPython.noop,
        ),
        migrations.AlterField(
            model_name="item",
            name="owner",
            field=models.ForeignKey(
                on_delete=django.db.models.deletion.CASCADE,
                related_name="items",
                to=settings.AUTH_USER_MODEL,
            ),
        ),
    ]
