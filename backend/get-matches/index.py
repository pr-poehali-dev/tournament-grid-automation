'''
Business: Get all tournament matches with team details
Args: event - dict with httpMethod
      context - object with request_id attribute
Returns: HTTP response with matches array
'''

import json
import os
import psycopg2
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Method not allowed'})
        }
    
    database_url = os.environ.get('DATABASE_URL')
    if not database_url:
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Database URL not configured'})
        }
    
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    
    query = '''
        SELECT 
            m.id, m.round, m.match_number, 
            m.team1_score, m.team2_score, m.winner_id, m.status,
            t1.id as team1_id, t1.name as team1_name, t1.logo_url as team1_logo,
            t2.id as team2_id, t2.name as team2_name, t2.logo_url as team2_logo
        FROM matches m
        LEFT JOIN teams t1 ON m.team1_id = t1.id
        LEFT JOIN teams t2 ON m.team2_id = t2.id
        ORDER BY 
            CASE m.round 
                WHEN 'quarter' THEN 1
                WHEN 'semi' THEN 2
                WHEN 'final' THEN 3
            END,
            m.match_number
    '''
    
    cursor.execute(query)
    rows = cursor.fetchall()
    
    matches = []
    for row in rows:
        match_data = {
            'id': row[0],
            'round': row[1],
            'match_number': row[2],
            'team1_score': row[3],
            'team2_score': row[4],
            'winner_id': row[5],
            'status': row[6]
        }
        
        if row[7]:
            match_data['team1'] = {
                'id': row[7],
                'name': row[8],
                'logo_url': row[9]
            }
        
        if row[10]:
            match_data['team2'] = {
                'id': row[10],
                'name': row[11],
                'logo_url': row[12]
            }
        
        matches.append(match_data)
    
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({'matches': matches})
    }
