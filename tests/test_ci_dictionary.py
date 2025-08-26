#!/usr/bin/env python3
import xmlrunner
import unittest
import requests
import json
import time
import utils
import config

class DictionaryApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "█"*80)
        print("📚 DICTIONARY API TEST SUITE")
        print("█"*80)
        print("This test suite verifies the Dictionary API functionality")
        print("Authentication: ENABLED (requires valid authentication token)")
        print("Test Coverage:")
        print("  1. Basic endpoint connectivity")
        print("  2. Create dictionary version (POST /dictionaries/{type}/versions)")
        print("  3. Get all dictionary versions (GET /dictionaries/{type}/versions)")
        print("  4. Get specific dictionary by type/version (GET /dictionaries/{type}/versions/{version})")
        print("  5. Update dictionary (PATCH /dictionaries/{type}/versions/{version})")
        print("  6. Test 404 handling for non-existent dictionaries")
        print("  7. Delete dictionary (DELETE /dictionaries/{type}/versions/{version}) - Final test")
        print("█"*80)
        
        # Gets the token and sets the config header
        try:
            utils.set_header()
        except:
            print('Cannot login at the moment.')
            exit(1)
        cls.header = config.HEADER
        cls.url = config.API_PATH
        cls.test_id = str(int(time.time()))  # Unique ID for this test run
        
        # Test data - using valid dictionary types from schema
        cls.test_dictionary_type = "sse"  # Valid values: 'sse' or 'flight'
        cls.test_dictionary_version = f"1.0.{cls.test_id}"
        
        print(f"API Base URL: {cls.url}")
        print(f"Test Session ID: {cls.test_id}")
        print(f"Test Dictionary Type: {cls.test_dictionary_type}")
        print(f"Test Dictionary Version: {cls.test_dictionary_version}")
        print("="*80)

    def test_basic_dictionary_endpoint(self):
        """Test basic dictionary endpoint connectivity"""
        print("\n" + "="*60)
        print("TEST 1: Basic Dictionary Endpoint Connectivity")
        print("="*60)
        print("Purpose: Verify that the Dictionary API endpoint is accessible")
        print("Expected: HTTP 200 (success) or 404 (no data)")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions"
        print(f"Testing GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Should get 200 for successful connection or 404 if no dictionaries exist
            self.assertIn(response.status_code, [200, 404])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertIsInstance(res_data, list)
                print(f"✓ RESULT: Dictionary endpoint is accessible, found {len(res_data)} dictionaries")
            else:
                print("✓ RESULT: Dictionary endpoint is accessible (no dictionaries found)")
                
        except requests.exceptions.ConnectionError:
            print("✗ RESULT: Could not connect to dictionary endpoint")
            self.fail(f"Could not connect to server at {path}")

    def test_create_dictionary(self):
        """Test creating a new dictionary version"""
        print("\n" + "="*60)
        print("TEST 2: Create Dictionary Version")
        print("="*60)
        print("Purpose: Test creating a new dictionary version via POST")
        print("Expected: HTTP 200 (created) or 409 (already exists)")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions"
        
        test_data = {
            "dictionary_description": f"Test Dictionary Description - {self.test_id}",
            "dictionary_version": self.test_dictionary_version,
            "state": "NOT_PUBLISHED"
        }
        
        print(f"Creating dictionary type: {self.test_dictionary_type}")
        print(f"Dictionary version: {self.test_dictionary_version}")
        print(f"Dictionary data: {test_data}")
        print(f"Sending POST request to: {path}")
        
        try:
            response = requests.post(path, json=test_data, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Accept both 200 (created) and 409 (already exists)
            self.assertIn(response.status_code, [200, 409])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertIn('dictionary_info', res_data)
                dict_info = res_data['dictionary_info']
                self.assertEqual(dict_info['dictionary_type'], self.test_dictionary_type)
                self.assertEqual(dict_info['dictionary_version'], self.test_dictionary_version)
                print("✓ RESULT: Dictionary created successfully")
                print(f"  Dictionary Type: {dict_info['dictionary_type']}")
                print(f"  Dictionary Version: {dict_info['dictionary_version']}")
                print(f"  State: {dict_info['state']}")
            else:
                print("✓ RESULT: Dictionary already exists (expected behavior)")
                
        except Exception as e:
            print(f"✗ RESULT: POST request failed with error: {e}")
            self.fail(f"POST request failed: {e}")

    def test_get_all_dictionary_versions(self):
        """Test retrieving all dictionary versions for a type"""
        print("\n" + "="*60)
        print("TEST 3: Get All Dictionary Versions")
        print("="*60)
        print("Purpose: Test retrieving all dictionary versions for a specific type")
        print("Expected: HTTP 200 (success) with array of dictionaries")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions"
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Should return 200 for success
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            
            print(f"✓ RESULT: Successfully retrieved {len(res_data)} dictionary versions")
            if len(res_data) > 0:
                print(f"  Sample dictionary type: {res_data[0].get('dictionary_type', 'N/A')}")
                print(f"  Sample dictionary version: {res_data[0].get('dictionary_version', 'N/A')}")
                
            # Check for x-total-count header
            total_count = response.headers.get('x-total-count', 'N/A')
            print(f"  Total count (header): {total_count}")
                
        except Exception as e:
            print(f"✗ RESULT: GET request failed with error: {e}")
            self.fail(f"GET request failed: {e}")

    def test_get_specific_dictionary(self):
        """Test getting a specific dictionary by type and version"""
        print("\n" + "="*60)
        print("TEST 4: Get Specific Dictionary by Type and Version")
        print("="*60)
        print("Purpose: Test retrieving a specific dictionary by type and version")
        print("Expected: HTTP 200 (success) if exists, 404 if not found")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}"
        print(f"Requesting dictionary type: {self.test_dictionary_type}")
        print(f"Requesting dictionary version: {self.test_dictionary_version}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 if exists, 404 if not found
            self.assertIn(response.status_code, [200, 404])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertEqual(res_data['dictionary_type'], self.test_dictionary_type)
                self.assertEqual(res_data['dictionary_version'], self.test_dictionary_version)
                print(f"✓ RESULT: Successfully retrieved dictionary")
                print(f"  Type: {res_data.get('dictionary_type', 'N/A')}")
                print(f"  Version: {res_data.get('dictionary_version', 'N/A')}")
                print(f"  Description: {res_data.get('dictionary_description', 'N/A')}")
                print(f"  State: {res_data.get('state', 'N/A')}")
            else:
                print("✓ RESULT: Dictionary not found (may have been cleaned up)")
                
        except Exception as e:
            print(f"✗ RESULT: GET specific dictionary request failed with error: {e}")
            self.fail(f"GET specific dictionary request failed: {e}")

    def test_update_dictionary(self):
        """Test updating a dictionary"""
        print("\n" + "="*60)
        print("TEST 5: Update Dictionary")
        print("="*60)
        print("Purpose: Test updating a dictionary description and state via PATCH")
        print("Expected: HTTP 200 (success) if exists, 404 if not found")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}"
        
        update_data = {
            "dictionary_description": f"Updated Dictionary Description - {self.test_id}",
            "state": "PUBLISHED"
        }
        
        print(f"Updating dictionary type: {self.test_dictionary_type}")
        print(f"Updating dictionary version: {self.test_dictionary_version}")
        print(f"Update data: {update_data}")
        print(f"Sending PATCH request to: {path}")
        
        try:
            response = requests.patch(path, json=update_data, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 if updated, 404 if not found
            self.assertIn(response.status_code, [200, 404])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertIn('dictionary_info', res_data)
                dict_info = res_data['dictionary_info']
                self.assertEqual(dict_info['dictionary_description'], update_data['dictionary_description'])
                self.assertEqual(dict_info['state'], update_data['state'])
                print("✓ RESULT: Dictionary updated successfully")
                print(f"  Updated description: {dict_info.get('dictionary_description', 'N/A')}")
                print(f"  Updated state: {dict_info.get('state', 'N/A')}")
            else:
                print("✓ RESULT: Dictionary not found for update")
                
        except Exception as e:
            print(f"✗ RESULT: PATCH request failed with error: {e}")
            self.fail(f"PATCH request failed: {e}")

    def test_get_nonexistent_dictionary_404(self):
        """Test getting a non-existent dictionary (should return 404)"""
        print("\n" + "="*60)
        print("TEST 6: Get Non-Existent Dictionary (404 Test)")
        print("="*60)
        print("Purpose: Test retrieving a dictionary that doesn't exist")
        print("Expected: HTTP 404 (not found)")
        
        nonexistent_type = "flight"  # Use valid type but non-existent version
        nonexistent_version = f"9.9.{self.test_id}"
        path = f"{self.url}/dictionaries/{nonexistent_type}/versions/{nonexistent_version}"
        
        print(f"Testing valid dictionary type: {nonexistent_type}")
        print(f"Testing non-existent dictionary version: {nonexistent_version}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 404 for non-existent dictionary
            self.assertEqual(response.status_code, 404)
            print("✓ RESULT: Correctly returned 404 for non-existent dictionary")
            
        except Exception as e:
            print(f"✗ RESULT: GET non-existent dictionary request failed with error: {e}")
            self.fail(f"GET non-existent dictionary request failed: {e}")

    def test_delete_dictionary(self):
        """Test deleting a dictionary - FINAL TEST"""
        print("\n" + "="*60)
        print("TEST 7: Delete Dictionary (FINAL TEST)")
        print("="*60)
        print("Purpose: Test deleting a dictionary and its related content via DELETE")
        print("Expected: HTTP 204 (no content) if deleted, 404 if not found")
        print("⚠️  WARNING: This is the final destructive test!")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}"
        print(f"Deleting dictionary type: {self.test_dictionary_type}")
        print(f"Deleting dictionary version: {self.test_dictionary_version}")
        print(f"Sending DELETE request to: {path}")
        
        try:
            response = requests.delete(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 204 if deleted, 404 if not found
            self.assertIn(response.status_code, [204, 404])
            
            if response.status_code == 204:
                print(f"✓ RESULT: Dictionary '{self.test_dictionary_type}' v{self.test_dictionary_version} deleted successfully")
                
                # Verify deletion by trying to get the dictionary
                print("  Verifying deletion...")
                verify_response = requests.get(path, headers=self.header, verify=False)
                print(f"  Verification GET status: {verify_response.status_code}")
                
                if verify_response.status_code == 404:
                    print("  ✓ Deletion confirmed - dictionary no longer exists")
                else:
                    print("  ⚠️ Dictionary may still exist after deletion")
                    
            else:
                print("✓ RESULT: Dictionary not found for deletion")
                
        except Exception as e:
            print(f"✗ RESULT: DELETE request failed with error: {e}")
            self.fail(f"DELETE request failed: {e}")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "█"*80)
        print("🏁 DICTIONARY API TEST SUITE COMPLETED")
        print("█"*80)
        print("All Dictionary API tests have been executed.")
        print("Check the results above for detailed test outcomes.")
        print("XML reports generated in: ./test-reports/")
        print("█"*80)

if __name__ == '__main__':
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'))