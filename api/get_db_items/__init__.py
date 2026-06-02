import json
import os
import traceback

import azure.functions as func
import pymssql


def main(req: func.HttpRequest) -> func.HttpResponse:
    try:
        # Get SQL server and database from environment (static config)
        server = os.environ.get('SQL_SERVER')
        database = os.environ.get('SQL_DATABASE')
        
        # Get credentials from request body
        try:
            req_body = req.get_json()
            user = req_body.get('username')
            password = req_body.get('password')
        except ValueError:
            user = req.params.get('username')
            password = req.params.get('password')

        if not all([server, user, password, database]):
            return func.HttpResponse(
                json.dumps({'error': 'Missing SQL configuration: SQL_SERVER, SQL_USER, SQL_PASSWORD, SQL_DATABASE'}),
                status_code=500,
                mimetype='application/json'
            )

        conn = pymssql.connect(
            server=server,
            user=user,
            password=password,
            database=database,
            timeout=30
        )
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
