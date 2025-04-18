DEFAULT_QUERY="SELECT * FROM games;"

QUERY=${1:-$DEFAULT_QUERY}

docker exec carcassonne-postgres psql -U carcassonne -d carcassonne -c "$QUERY"