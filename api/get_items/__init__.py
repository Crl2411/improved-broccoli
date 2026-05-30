import json
import os
import traceback

import azure.functions as func
import pyodbc


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        conn_str = os.environ.get('SQL_CONNECTION_STRING')
        if not conn_str:
            return func.HttpResponse(
                json.dumps({'error': 'SQL_CONNECTION_STRING environment variable not set'}),
                status_code=500,
                mimetype='application/json'
            )

        conn = pyodbc.connect(conn_str, autocommit=True)
        cursor = conn.cursor()
        cursor.execute('SELECT TOP 50 SchemeID, SchemeName, Regulator FROM dbo.Schemes')
        columns = [column[0] for column in cursor.description]
        rows = cursor.fetchall()
        items = [dict(zip(columns, row)) for row in rows]
        conn.close()

        return func.HttpResponse(
            json.dumps(items),
            status_code=200,
            mimetype='application/json'
        )
    except Exception as exc:
        error_detail = f"{type(exc).__name__}: {str(exc)}\n{traceback.format_exc()}"
        return func.HttpResponse(
            json.dumps({'error': error_detail}),
            status_code=500,
            mimetype='application/json'
        )
