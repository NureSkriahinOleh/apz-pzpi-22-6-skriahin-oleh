#!/bin/bash

echo "Чекаємо, поки Postgres (БД) буде доступним на $DB_HOST:$DB_PORT ..."
while ! nc -z $DB_HOST $DB_PORT; do
  sleep 1
done
echo "Postgres доступний!"

echo "Виконуємо міграції Django..."
python manage.py migrate --noinput

echo "Запускаємо Daphne..."

daphne -b 0.0.0.0 -p 8000 SmartShield.asgi:application

