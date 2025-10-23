import json
import os
import psycopg
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Получение настроек турнира (ID Challonge, режим iframe)
    Args: event с httpMethod
    Returns: Настройки турнира для всех пользователей
    '''
    method: str = event.get('httpMethod', 'GET')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'GET, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'GET':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg.connect(dsn)
    cur = conn.cursor()
    
    cur.execute("SELECT key, value FROM settings WHERE key IN ('challonge_tournament_id', 'challonge_iframe_mode')")
    rows = cur.fetchall()
    
    settings = {}
    for row in rows:
        settings[row[0]] = row[1]
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'tournament_id': settings.get('challonge_tournament_id'),
            'iframe_mode': settings.get('challonge_iframe_mode') == 'true'
        })
    }
