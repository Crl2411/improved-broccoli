import json
import os

import azure.functions as func
import pyodbc


def get_connection():
    conn_str = os.environ.get('SQL_CONNECTION_STRING')
    if not conn_str:
        raise ValueError('Missing SQL_CONNECTION_STRING environment variable')
    return pyodbc.connect(conn_str, autocommit=True)


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        with get_connection() as conn:
            cursor = conn.cursor()
            cursor.execute('SELECT TOP 50 SchemeID, SchemeName, Regulator FROM dbo.Schemes')
            columns = [column[0] for column in cursor.description]
            rows = cursor.fetchall()
            items = [dict(zip(columns, row)) for row in rows]

        return func.HttpResponse(
            json.dumps(items),
            status_code=200,
            mimetype='application/json'
        )
    except Exception as exc:
        return func.HttpResponse(
            json.dumps({'error': str(exc)}),
            status_code=500,
            mimetype='application/json'
        )
