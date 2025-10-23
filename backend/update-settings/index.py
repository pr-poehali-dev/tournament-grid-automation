import json
import os
import psycopg
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Обновление настроек турнира (только для админа)
    Args: event с httpMethod и body (tournament_id, iframe_mode)
    Returns: Подтверждение обновления
    '''
    method: str = event.get('httpMethod', 'POST')
    
    if method == 'OPTIONS':
        return {
            'statusCode': 200,
            'headers': {
                'Access-Control-Allow-Origin': '*',
                'Access-Control-Allow-Methods': 'POST, OPTIONS',
                'Access-Control-Allow-Headers': 'Content-Type',
                'Access-Control-Max-Age': '86400'
            },
            'body': ''
        }
    
    if method != 'POST':
        return {
            'statusCode': 405,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    body_data = json.loads(event.get('body', '{}'))
    tournament_id = body_data.get('tournament_id')
    iframe_mode = body_data.get('iframe_mode', False)
    
    dsn = os.environ.get('DATABASE_URL')
    
    conn = psycopg.connect(dsn, autocommit=True)
    cur = conn.cursor()
    
    tournament_id_escaped = tournament_id.replace("'", "''") if tournament_id else None
    iframe_value = 'true' if iframe_mode else 'false'
    
    if tournament_id_escaped:
        cur.execute(f"UPDATE settings SET value = '{tournament_id_escaped}', updated_at = CURRENT_TIMESTAMP WHERE key = 'challonge_tournament_id'")
    else:
        cur.execute(f"UPDATE settings SET value = NULL, updated_at = CURRENT_TIMESTAMP WHERE key = 'challonge_tournament_id'")
    
    cur.execute(f"UPDATE settings SET value = '{iframe_value}', updated_at = CURRENT_TIMESTAMP WHERE key = 'challonge_iframe_mode'")
    
    cur.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'tournament_id': tournament_id,
            'iframe_mode': iframe_mode
        })
    }