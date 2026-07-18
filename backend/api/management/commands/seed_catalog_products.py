from django.core.management.base import BaseCommand

from api import product_service


class Command(BaseCommand):
    help = "Seed CatalogProduct rows from src/data/catalog.json and export catalog_live.json"

    def add_arguments(self, parser):
        parser.add_argument(
            "--force",
            action="store_true",
            help="Update existing products from JSON",
        )

    def handle(self, *args, **options):
        result = product_service.seed_from_catalog_json(force=bool(options["force"]))
        self.stdout.write(
            self.style.SUCCESS(
                f"Catalog seed: created={result['created']} updated={result['updated']} skipped={result['skipped']}"
            )
        )
