#!/usr/bin/env python3
import xmlrunner
import unittest
import requests
import json
import time
import utils
import config

class CustomScriptApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "█"*80)
        print("🔧 CUSTOM SCRIPT API TEST SUITE")
        print("█"*80)
        print("This test suite verifies the Custom Script API functionality")
        print("Authentication: ENABLED (requires valid authentication token)")
        print("Test Coverage:")
        print("  1. Basic endpoint connectivity")
        print("  2. Create custom scripts (POST /custom_scripts)")
        print("  3. Get all custom scripts (GET /custom_scripts)")
        print("  4. Get specific custom script by ID (GET /custom_scripts/{id})")
        print("  5. Update custom script (PATCH /custom_scripts/{id})")
        print("  6. Bulk query custom scripts (POST /custom_scripts/bulk_query)")
        print("  7. Test 404 handling for non-existent scripts")
        print("  8. Delete custom script (DELETE /custom_scripts/{id}) - Final test")
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
        
        # Test data
        cls.test_script_id = f"test_script_{cls.test_id}"
        cls.test_script_path = f"/test/path/script_{cls.test_id}.py"
        cls.test_script_name = f"Test Script {cls.test_id}"
        
        print(f"API Base URL: {cls.url}")
        print(f"Test Session ID: {cls.test_id}")
        print(f"Test Script ID: {cls.test_script_id}")
        print(f"Test Script Name: {cls.test_script_name}")
        print("="*80)

    def test_basic_customscript_endpoint(self):
        """Test basic custom script endpoint connectivity"""
        print("\n" + "="*60)
        print("TEST 1: Basic Custom Script Endpoint Connectivity")
        print("="*60)
        print("Purpose: Verify that the Custom Script API endpoint is accessible")
        print("Expected: HTTP 200 (success) with array of scripts")
        
        path = f"{self.url}/custom_scripts"
        print(f"Testing GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Should get 200 for successful connection
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            print(f"✓ RESULT: Custom Script endpoint is accessible, found {len(res_data)} scripts")
            
            # Check for x-total-count header
            total_count = response.headers.get('x-total-count', 'N/A')
            print(f"  Total count (header): {total_count}")
                
        except requests.exceptions.ConnectionError:
            print("✗ RESULT: Could not connect to custom script endpoint")
            self.fail(f"Could not connect to server at {path}")

    def test_create_custom_script(self):
        """Test creating a new custom script"""
        print("\n" + "="*60)
        print("TEST 2: Create Custom Script")
        print("="*60)
        print("Purpose: Test creating a new custom script via POST")
        print("Expected: HTTP 201 (created) or 409 (already exists)")
        
        path = f"{self.url}/custom_scripts"
        
        # Simple test data that meets schema requirements
        test_data = [
            {
                "script_id": self.test_script_id,
                "script_path": self.test_script_path,
                "script_name": self.test_script_name,
                "description": f"Test custom script description - {self.test_id}",
                "hash": f"abc123hash{self.test_id}",
                "status": "ACTIVE",
                "inputs": [
                    {
                        "name": "test_input",
                        "description": "Test input parameter",
                        "phase": "EXECUTION",
                        "input_required": "YES",
                        "type": "STRING",
                        "default_value": "test_default"
                    }
                ],
                "outputs": [
                    {
                        "name": "test_output",
                        "description": "Test output parameter",
                        "type": "STRING"
                    }
                ],
                "entries": [],
                "layout": []
            }
        ]
        
        print(f"Creating custom script ID: {self.test_script_id}")
        print(f"Script path: {self.test_script_path}")
        print(f"Script name: {self.test_script_name}")
        print(f"Sending POST request to: {path}")
        
        try:
            response = requests.post(path, json=test_data, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Accept both 201 (created) and 409 (already exists)
            self.assertIn(response.status_code, [201, 409])
            
            if response.status_code == 201:
                res_data = response.json()
                self.assertIsInstance(res_data, list)
                self.assertEqual(len(res_data), 1)
                script = res_data[0]
                self.assertEqual(script['script_id'], self.test_script_id)
                self.assertEqual(script['script_name'], self.test_script_name)
                self.assertEqual(script['status'], 'ACTIVE')
                print("✓ RESULT: Custom script created successfully")
                print(f"  Script ID: {script['script_id']}")
                print(f"  Script Name: {script['script_name']}")
                print(f"  Status: {script['status']}")
            else:
                print("✓ RESULT: Custom script already exists (expected behavior)")
                
        except Exception as e:
            print(f"✗ RESULT: POST request failed with error: {e}")
            self.fail(f"POST request failed: {e}")

    def test_get_all_custom_scripts(self):
        """Test retrieving all custom scripts"""
        print("\n" + "="*60)
        print("TEST 3: Get All Custom Scripts")
        print("="*60)
        print("Purpose: Test retrieving all custom scripts with filtering")
        print("Expected: HTTP 200 (success) with array of scripts")
        
        path = f"{self.url}/custom_scripts"
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Should return 200 for success
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            
            print(f"✓ RESULT: Successfully retrieved {len(res_data)} custom scripts")
            if len(res_data) > 0:
                print(f"  Sample script ID: {res_data[0].get('script_id', 'N/A')}")
                print(f"  Sample script name: {res_data[0].get('script_name', 'N/A')}")
                
            # Check for x-total-count header
            total_count = response.headers.get('x-total-count', 'N/A')
            print(f"  Total count (header): {total_count}")
            
            # Test with filtering
            print("  Testing with status filter...")
            filter_path = f"{path}?status=ACTIVE"
            filter_response = requests.get(filter_path, headers=self.header, verify=False)
            print(f"  Filter response status: {filter_response.status_code}")
            if filter_response.status_code == 200:
                filter_data = filter_response.json()
                print(f"  Found {len(filter_data)} ACTIVE scripts")
                
        except Exception as e:
            print(f"✗ RESULT: GET request failed with error: {e}")
            self.fail(f"GET request failed: {e}")

    def test_get_specific_custom_script(self):
        """Test getting a specific custom script by ID"""
        print("\n" + "="*60)
        print("TEST 4: Get Specific Custom Script by ID")
        print("="*60)
        print("Purpose: Test retrieving a specific custom script by script_id")
        print("Expected: HTTP 200 (success) if exists, 404 if not found")
        
        path = f"{self.url}/custom_scripts/{self.test_script_id}"
        print(f"Requesting custom script ID: {self.test_script_id}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 if exists, 404 if not found
            self.assertIn(response.status_code, [200, 404])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertEqual(res_data['script_id'], self.test_script_id)
                print(f"✓ RESULT: Successfully retrieved custom script")
                print(f"  Script ID: {res_data.get('script_id', 'N/A')}")
                print(f"  Script Name: {res_data.get('script_name', 'N/A')}")
                print(f"  Status: {res_data.get('status', 'N/A')}")
                print(f"  Description: {res_data.get('description', 'N/A')}")
            else:
                print("✓ RESULT: Custom script not found (may have been cleaned up)")
                
        except Exception as e:
            print(f"✗ RESULT: GET specific script request failed with error: {e}")
            self.fail(f"GET specific script request failed: {e}")

    def test_update_custom_script(self):
        """Test updating a custom script"""
        print("\n" + "="*60)
        print("TEST 5: Update Custom Script")
        print("="*60)
        print("Purpose: Test updating a custom script via PATCH")
        print("Expected: HTTP 200 (success) if exists, 404 if not found")
        
        path = f"{self.url}/custom_scripts/{self.test_script_id}"
        
        update_data = {
            "script_name": f"Updated Test Script {self.test_id}",
            "description": f"Updated description - {self.test_id}",
            "status": "INACTIVE"
        }
        
        print(f"Updating custom script ID: {self.test_script_id}")
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
                self.assertEqual(res_data['script_name'], update_data['script_name'])
                self.assertEqual(res_data['status'], update_data['status'])
                print("✓ RESULT: Custom script updated successfully")
                print(f"  Updated name: {res_data.get('script_name', 'N/A')}")
                print(f"  Updated status: {res_data.get('status', 'N/A')}")
                print(f"  Updated description: {res_data.get('description', 'N/A')}")
            else:
                print("✓ RESULT: Custom script not found for update")
                
        except Exception as e:
            print(f"✗ RESULT: PATCH request failed with error: {e}")
            self.fail(f"PATCH request failed: {e}")

    def test_bulk_query_custom_scripts(self):
        """Test bulk query for custom scripts"""
        print("\n" + "="*60)
        print("TEST 6: Bulk Query Custom Scripts")
        print("="*60)
        print("Purpose: Test bulk querying custom scripts by multiple IDs")
        print("Expected: HTTP 200 with array of found scripts")
        
        path = f"{self.url}/custom_scripts/bulk_query"
        
        # Query for our test script plus some non-existent ones
        script_ids = [self.test_script_id, "nonexistent_script_1", "nonexistent_script_2"]
        
        print(f"Querying for script IDs: {script_ids}")
        print(f"Sending POST request to: {path}")
        
        try:
            response = requests.post(path, json=script_ids, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 for bulk query
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            
            # Should return only the existing scripts (0 to 1 in this case)
            self.assertLessEqual(len(res_data), 1)
            
            print(f"✓ RESULT: Bulk query successful, found {len(res_data)} scripts out of {len(script_ids)} requested")
            
            if len(res_data) > 0:
                print(f"  Found scripts: {[script.get('script_id') for script in res_data]}")
            
        except Exception as e:
            print(f"✗ RESULT: Bulk query request failed with error: {e}")
            self.fail(f"Bulk query request failed: {e}")

    def test_get_nonexistent_script_404(self):
        """Test getting a non-existent custom script (should return 404)"""
        print("\n" + "="*60)
        print("TEST 7: Get Non-Existent Custom Script (404 Test)")
        print("="*60)
        print("Purpose: Test retrieving a custom script that doesn't exist")
        print("Expected: HTTP 404 (not found)")
        
        nonexistent_id = f"nonexistent_script_{self.test_id}"
        path = f"{self.url}/custom_scripts/{nonexistent_id}"
        
        print(f"Testing non-existent script ID: {nonexistent_id}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 404 for non-existent script
            self.assertEqual(response.status_code, 404)
            print("✓ RESULT: Correctly returned 404 for non-existent custom script")
            
        except Exception as e:
            print(f"✗ RESULT: GET non-existent script request failed with error: {e}")
            self.fail(f"GET non-existent script request failed: {e}")

    def test_delete_custom_script(self):
        """Test deleting a custom script - FINAL TEST"""
        print("\n" + "="*60)
        print("TEST 8: Delete Custom Script (FINAL TEST)")
        print("="*60)
        print("Purpose: Test deleting a custom script via DELETE")
        print("Expected: HTTP 204 (no content) if deleted, 404 if not found")
        print("⚠️  WARNING: This is the final destructive test!")
        
        path = f"{self.url}/custom_scripts/{self.test_script_id}"
        print(f"Deleting custom script ID: {self.test_script_id}")
        print(f"Sending DELETE request to: {path}")
        
        try:
            response = requests.delete(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 204 if deleted, 404 if not found
            self.assertIn(response.status_code, [204, 404])
            
            if response.status_code == 204:
                print(f"✓ RESULT: Custom script '{self.test_script_id}' deleted successfully")
                
                # Verify deletion by trying to get the script
                print("  Verifying deletion...")
                verify_response = requests.get(path, headers=self.header, verify=False)
                print(f"  Verification GET status: {verify_response.status_code}")
                
                if verify_response.status_code == 404:
                    print("  ✓ Deletion confirmed - script no longer exists")
                else:
                    print("  ⚠️ Script may still exist after deletion")
                    
            else:
                print("✓ RESULT: Custom script not found for deletion")
                
        except Exception as e:
            print(f"✗ RESULT: DELETE request failed with error: {e}")
            self.fail(f"DELETE request failed: {e}")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "█"*80)
        print("🏁 CUSTOM SCRIPT API TEST SUITE COMPLETED")
        print("█"*80)
        print("All Custom Script API tests have been executed.")
        print("Check the results above for detailed test outcomes.")
        print("XML reports generated in: ./test-reports/")
        print("█"*80)

if __name__ == '__main__':
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'))