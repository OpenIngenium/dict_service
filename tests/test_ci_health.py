#!/usr/bin/env python3
import xmlrunner
import unittest
import requests
import json
import time
import config

class HealthApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "█"*80)
        print("🏥 HEALTH API TEST SUITE")
        print("█"*80)
        print("This test suite verifies the Health API endpoint functionality")
        print("Authentication: NOT REQUIRED (public health endpoint)")
        print("Test Coverage:")
        print("  1. Basic health endpoint connectivity and status")
        print("  2. Response format validation and structure")
        print("█"*80)
        
        cls.url = config.API_PATH
        cls.test_id = str(int(time.time()))  # Unique ID for this test run
        
        print(f"API Base URL: {cls.url}")
        print(f"Test Session ID: {cls.test_id}")
        print("="*80)

    def test_health_endpoint_returns_ok(self):
        """Test that the health endpoint returns status OK with 200 status code"""
        print("\n" + "="*60)
        print("TEST 1: Health Endpoint Status and Connectivity")
        print("="*60)
        print("Purpose: Verify that the health endpoint is accessible and returns OK status")
        print("Expected: HTTP 200 with JSON response containing {'status': 'OK'}")
        
        path = f"{self.url}/health"
        print(f"Testing health endpoint: {path}")
        
        try:
            print("Sending GET request to health endpoint...")
            response = requests.get(path, verify=False)
            
            print(f"✓ Connection successful")
            print(f"✓ Response Status Code: {response.status_code}")
            print(f"✓ Response Content: {response.text}")
            print(f"✓ Response Headers: {dict(response.headers)}")
            
        except requests.exceptions.ConnectionError:
            print("✗ RESULT: Could not connect to health endpoint")
            self.fail(f"Could not connect to server at {path}. Make sure the server is running.")
        
        # Assert successful response
        self.assertEqual(response.status_code, 200, 
                        f"Expected 200, got {response.status_code}. Response: {response.text}")
        
        # Check if response is valid JSON
        try:
            response_data = response.json()
            print(f"✓ Response is valid JSON: {response_data}")
        except json.JSONDecodeError:
            print("✗ RESULT: Response is not valid JSON")
            self.fail(f"Response is not valid JSON. Content: {response.text}")
        
        # Assert response structure
        self.assertIn('status', response_data)
        self.assertEqual(response_data['status'], 'OK')
        
        print("✓ RESULT: Health endpoint is working correctly")
        print(f"  Status: {response_data['status']}")
        print(f"  Response time: {response.elapsed.total_seconds():.3f} seconds")
        
    def test_health_endpoint_response_format(self):
        """Test that the health endpoint returns the correct response format"""
        print("\n" + "="*60)
        print("TEST 2: Health Endpoint Response Format Validation")
        print("="*60)
        print("Purpose: Verify the health endpoint returns properly structured JSON")
        print("Expected: Valid JSON dictionary with exactly one 'status' field of type string")
        
        path = f"{self.url}/health"
        print(f"Testing response format from: {path}")
        
        try:
            print("Sending GET request for format validation...")
            response = requests.get(path, verify=False)
            print(f"✓ Request successful with status: {response.status_code}")
            
        except requests.exceptions.ConnectionError:
            print("✗ RESULT: Could not connect to health endpoint")
            self.fail(f"Could not connect to server at {path}. Make sure the server is running.")
        
        # Check if response is valid JSON before proceeding
        try:
            response_data = response.json()
            print(f"✓ Response is valid JSON: {response_data}")
        except json.JSONDecodeError:
            print("✗ RESULT: Response is not valid JSON")
            self.fail(f"Response is not valid JSON. Content: {response.text}")
        
        # Assert response is a dictionary
        self.assertIsInstance(response_data, dict)
        print("✓ Response is a dictionary")
        
        # Assert response has only the expected fields
        self.assertEqual(len(response_data), 1)
        print(f"✓ Response has exactly {len(response_data)} field(s)")
        
        self.assertIn('status', response_data)
        print("✓ Response contains 'status' field")
        
        self.assertIsInstance(response_data['status'], str)
        print(f"✓ Status field is a string: '{response_data['status']}'")
        
        print("✓ RESULT: Health endpoint response format is valid")
        print(f"  Field count: {len(response_data)}")
        print(f"  Status value: {response_data['status']}")
        print(f"  Status type: {type(response_data['status']).__name__}")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "█"*80)
        print("🏁 HEALTH API TEST SUITE COMPLETED")
        print("█"*80)
        print("All Health API tests have been executed successfully.")
        print("The health endpoint is functioning correctly and ready for use.")
        print("XML reports generated in: ./test-reports/")
        print("█"*80)

if __name__ == '__main__':
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'))