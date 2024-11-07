import requests
import urllib
from datetime import datetime

#--- Obtain an API access token ---

auth_url = 'https://api.auth.dtn.com/v1/tokens/authorize'

body = {
    'grant_type': 'client_credentials',
    'client_id': 'ti5EIU0BJUuZPmsNnTfdsu5KePbIRgtL',
	'client_secret': '3gzCHFoUdCk-OsOMMSn8O19qfVi4zkcJsF6OkTjs7lD9femzdzZc8O3HxdhmacHp',
    'audience': 'https://weather.api.dtn.com/conditions'
}
response = requests.post(auth_url, json=body)
access_token = response.json()['data']['access_token']

#--- Invoke the API ---

api_base_url = 'https://weather.api.dtn.com/v2'
current_time = datetime.utcnow().isoformat() + 'Z'  # Current time in ISO format

query_parameters = urllib.parse.urlencode({
    "lat": 35.47,
    "lon": -97.51,
    "startTime": current_time,
    "endTime": "2024-11-14T00:06:10Z",
})
endpoint = '/conditions?' + query_parameters

headers = {'Authorization': 'Bearer ' + access_token}
response = requests.get(api_base_url + endpoint, headers=headers)

#--- Print the response ---

print(response.json())
