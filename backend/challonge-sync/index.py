import json
import os
import requests
from typing import Dict, Any

def handler(event: Dict[str, Any], context: Any) -> Dict[str, Any]:
    '''
    Business: Синхронизация турнирной сетки с Challonge
    Args: event с queryStringParameters (tournament_id или tournament_url)
    Returns: Данные турнира и матчей из Challonge
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
    
    api_key = os.environ.get('CHALLONGE_API_KEY')
    if not api_key:
        return {
            'statusCode': 500,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'CHALLONGE_API_KEY not configured'})
        }
    
    params = event.get('queryStringParameters') or {}
    tournament_id = params.get('tournament_id') or params.get('tournament_url')
    
    if not tournament_id:
        return {
            'statusCode': 400,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': 'tournament_id or tournament_url required'})
        }
    
    headers = {
        'Authorization': f'Bearer {api_key}',
        'Accept': 'application/json'
    }
    
    tournament_url = f'https://api.challonge.com/v1/tournaments/{tournament_id}.json'
    matches_url = f'https://api.challonge.com/v1/tournaments/{tournament_id}/matches.json'
    participants_url = f'https://api.challonge.com/v1/tournaments/{tournament_id}/participants.json'
    
    tournament_data = requests.get(tournament_url, headers=headers)
    if tournament_data.status_code != 200:
        return {
            'statusCode': tournament_data.status_code,
            'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
            'body': json.dumps({'error': f'Challonge API error: {tournament_data.text}'})
        }
    
    matches_data = requests.get(matches_url, headers=headers)
    participants_data = requests.get(participants_url, headers=headers)
    
    tournament = tournament_data.json()
    matches = matches_data.json() if matches_data.status_code == 200 else []
    participants = participants_data.json() if participants_data.status_code == 200 else []
    
    participants_map = {}
    for p in participants:
        participant = p.get('participant', {})
        participants_map[participant.get('id')] = {
            'id': participant.get('id'),
            'name': participant.get('name') or participant.get('display_name'),
            'seed': participant.get('seed')
        }
    
    formatted_matches = []
    for m in matches:
        match = m.get('match', {})
        round_num = match.get('round', 0)
        
        if round_num == 1:
            round_name = 'round16'
        elif round_num == 2:
            round_name = 'quarter'
        elif round_num == 3:
            round_name = 'semi'
        elif round_num == 4:
            round_name = 'final'
        else:
            round_name = f'round{abs(round_num)}'
        
        team1_id = match.get('player1_id')
        team2_id = match.get('player2_id')
        winner_id = match.get('winner_id')
        
        formatted_match = {
            'id': match.get('id'),
            'round': round_name,
            'match_number': match.get('suggested_play_order', 0),
            'team1': participants_map.get(team1_id) if team1_id else None,
            'team2': participants_map.get(team2_id) if team2_id else None,
            'team1_score': int(match.get('scores_csv', '0-0').split('-')[0]) if match.get('scores_csv') else 0,
            'team2_score': int(match.get('scores_csv', '0-0').split('-')[1]) if match.get('scores_csv') else 0,
            'winner_id': winner_id,
            'status': 'finished' if match.get('state') == 'complete' else 'pending'
        }
        formatted_matches.append(formatted_match)
    
    return {
        'statusCode': 200,
        'headers': {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*'},
        'isBase64Encoded': False,
        'body': json.dumps({
            'tournament': tournament.get('tournament', {}),
            'matches': formatted_matches,
            'participants': list(participants_map.values())
        })
    }
