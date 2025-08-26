import os

ING_ADDRESS = os.environ.get('INGENIUM_SERVER')
AUTH_ENDPOINT = 'auth_service/api/v2/login'
TEST_USER = os.environ.get('USERNAME')
TEST_PASS = os.environ.get('PASSWORD')
HEADER = {'Authorization': ''}
SERVER = os.environ.get('DICT_SERVICE_URL', 'http://localhost:5000')
API_PATH = '{0}/api/v4'.format(SERVER) 
# use below to run tests locally
# API_PATH = "http://localhost/dict_server/api/v4"
