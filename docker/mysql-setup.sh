#!/bin/sh
set -eu

DB_USER="${DB_USER:-invoice_user}"
DB_PASSWORD="${DB_PASSWORD:-invoice_password}"
DB_NAME="${DB_NAME:-invoice_generator}"
DB_HOST="${DB_HOST:-mysql}"
DB_PORT="${DB_PORT:-3306}"

until mysqladmin ping -h"${DB_HOST}" -P"${DB_PORT}" -uroot -p"${MYSQL_ROOT_PASSWORD}" --silent; do
  sleep 2
done

mysql -h"${DB_HOST}" -P"${DB_PORT}" -uroot -p"${MYSQL_ROOT_PASSWORD}" <<SQL
CREATE USER IF NOT EXISTS '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
ALTER USER '${DB_USER}'@'%' IDENTIFIED BY '${DB_PASSWORD}';
GRANT ALL PRIVILEGES ON \`${DB_NAME}\`.* TO '${DB_USER}'@'%';
GRANT CREATE, DROP, ALTER, REFERENCES, INDEX ON *.* TO '${DB_USER}'@'%';
FLUSH PRIVILEGES;
SQL
