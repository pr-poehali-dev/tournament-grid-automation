'''
Business: Generate tournament bracket with automatic team seeding
Args: event - dict with httpMethod
      context - object with request_id attribute
Returns: HTTP response with created matches count
'''

import json
import os
import psycopg2
from typing import Dict, Any, List, Tuple
import random

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
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
    
    cursor.execute('DELETE FROM matches')
    conn.commit()
    
    cursor.execute('SELECT id, name FROM teams ORDER BY id LIMIT 8')
    teams: List[Tuple[int, str]] = cursor.fetchall()
    
    if len(teams) < 8:
        cursor.close()
        conn.close()
        return {
            'statusCode': 400,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({'error': 'Need at least 8 teams for tournament'})
        }
    
    shuffled_teams = list(teams)
    random.shuffle(shuffled_teams)
    
    matches_created = 0
    
    quarter_pairs = [
        (shuffled_teams[0], shuffled_teams[1]),
        (shuffled_teams[2], shuffled_teams[3]),
        (shuffled_teams[4], shuffled_teams[5]),
        (shuffled_teams[6], shuffled_teams[7])
    ]
    
    for idx, (team1, team2) in enumerate(quarter_pairs, 1):
        cursor.execute(
            "INSERT INTO matches (round, match_number, team1_id, team2_id, status) VALUES (%s, %s, %s, %s, %s)",
            ('quarter', idx, team1[0], team2[0], 'pending')
        )
        matches_created += 1
    
    for idx in range(1, 3):
        cursor.execute(
            "INSERT INTO matches (round, match_number, status) VALUES (%s, %s, %s)",
            ('semi', idx, 'pending')
        )
        matches_created += 1
    
    cursor.execute(
        "INSERT INTO matches (round, match_number, status) VALUES (%s, %s, %s)",
        ('final', 1, 'pending')
    )
    matches_created += 1
    
    conn.commit()
    cursor.close()
    conn.close()
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'isBase64Encoded': False,
        'body': json.dumps({
            'success': True,
            'matchesCreated': matches_created,
            'teamsSeeded': len(teams)
        })
    }
