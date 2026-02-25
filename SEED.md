# Database seed scripts (export / import)

Use these scripts to export your current database to JSON files and import them into another database (e.g. another environment or Railway).

## Export (current DB → JSON files)

From the **backend** folder:

```bash
# Uses DATABASE_URL from .env (or environment)
npm run seed:export
```

This creates a `seed-data/` folder with:

- `users.json`
- `products.json`
- `contact_requests.json`
- `graphics_requests.json`
- `orders.json`
- `order_items.json`

You can copy the `seed-data/` folder to another machine or commit it (ensure it doesn’t contain sensitive data).

## Import (JSON files → database)

1. Put the `seed-data/` folder with the JSON files in the backend root.
2. Set **DATABASE_URL** to the target database (e.g. in `.env` or environment).
3. Run:

```bash
npm run seed:import
```

By default, existing data in the target DB is **truncated** before import. To import without clearing tables (append only), set:

```bash
SEED_CLEAR=0 npm run seed:import
```

(Use append only if the target DB is empty or you know there are no ID conflicts.)

## Typical workflow

1. **Export from source DB**  
   Set `DATABASE_URL` to the source DB, run `npm run seed:export`.

2. **Copy** the `seed-data/` folder to the target environment.

3. **Import into target DB**  
   Set `DATABASE_URL` to the target DB, run `npm run seed:import`.

Ids (including user UUIDs and order/item ids) are preserved so relations stay valid.
