#!/usr/bin/env python3
import xmlrunner
import unittest
import requests
import json
import time
import utils
import config

class DictionaryContentApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "█"*80)
        print("📖 DICTIONARY CONTENT API TEST SUITE")
        print("█"*80)
        print("This test suite verifies the Dictionary Content API functionality")
        print("Authentication: ENABLED (requires valid authentication token)")
        print("Test Coverage - Commands (cmds) endpoint:")
        print("  1. Basic endpoint connectivity")
        print("  2. Create commands (POST /dictionaries/{type}/versions/{version}/cmds)")
        print("  3. Get all commands (GET /dictionaries/{type}/versions/{version}/cmds)")
        print("  4. Get specific command by stem (GET /dictionaries/{type}/versions/{version}/cmds/{stem})")
        print("  5. Update command (PATCH /dictionaries/{type}/versions/{version}/cmds/{stem})")
        print("  6. Bulk query commands (POST /dictionaries/{type}/versions/{version}/cmds/bulk_query)")
        print("  7. Test 404 handling for non-existent commands")
        print("  8. Delete command (DELETE /dictionaries/{type}/versions/{version}/cmds/{stem}) - Final test")
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
        cls.test_command_stem = f"TEST_CMD_{cls.test_id}"
        
        print(f"API Base URL: {cls.url}")
        print(f"Test Session ID: {cls.test_id}")
        print(f"Test Dictionary Type: {cls.test_dictionary_type}")
        print(f"Test Dictionary Version: {cls.test_dictionary_version}")
        print(f"Test Command Stem: {cls.test_command_stem}")
        print("="*80)

        # Create a test dictionary first (required for content operations)
        cls._create_test_dictionary()

    @classmethod
    def _create_test_dictionary(cls):
        """Create a test dictionary to hold our content"""
        print(f"\n📋 Creating test dictionary for content...")
        
        dict_path = f"{cls.url}/dictionaries/{cls.test_dictionary_type}/versions"
        
        dict_data = {
            "dictionary_description": f"Test Dictionary for Content - {cls.test_id}",
            "dictionary_version": cls.test_dictionary_version,
            "state": "NOT_PUBLISHED"
        }
        
        try:
            response = requests.post(dict_path, json=dict_data, headers=cls.header, verify=False)
            if response.status_code == 200:
                print("✓ Test dictionary created successfully")
            elif response.status_code == 409:
                print("✓ Test dictionary already exists")
            else:
                print(f"⚠️ Dictionary creation returned {response.status_code}: {response.text}")
        except Exception as e:
            print(f"⚠️ Could not create test dictionary: {e}")

    def test_basic_dictionarycontent_endpoint(self):
        """Test basic dictionary content endpoint connectivity"""
        print("\n" + "="*60)
        print("TEST 1: Basic Dictionary Content Endpoint Connectivity")
        print("="*60)
        print("Purpose: Verify that the Dictionary Content API endpoint is accessible")
        print("Expected: HTTP 200 (success) with array of commands")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds"
        print(f"Testing GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Should get 200 for successful connection
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            print(f"✓ RESULT: Dictionary Content endpoint is accessible, found {len(res_data)} commands")
            
            # Check for x-total-count header
            total_count = response.headers.get('x-total-count', 'N/A')
            print(f"  Total count (header): {total_count}")
                
        except requests.exceptions.ConnectionError:
            print("✗ RESULT: Could not connect to dictionary content endpoint")
            self.fail(f"Could not connect to server at {path}")

    def test_create_command(self):
        """Test creating a new command"""
        print("\n" + "="*60)
        print("TEST 2: Create Command")
        print("="*60)
        print("Purpose: Test creating a new command via POST")
        print("Expected: HTTP 201 (created) or 409 (already exists)")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds"
        
        # Test data that meets schema requirements
        test_data = [
            {
                "command_stem": self.test_command_stem,
                "operations_category": "TEST_CATEGORY",
                "cmd_description": f"Test command description - {self.test_id}",
                "restricted_modes": ["MODE1", "MODE2"],
                "cmd_type": "FSW",
                "repeat_min": 0,
                "repeat_max": 5,
                "arguments": [
                    {
                        "argument_type": "INT",
                        "argument_size": 4,
                        "argument_description": "Test integer argument",
                        "repeat_arg": "No",
                        "allowable_ranges": [
                            {
                                "min_value": "0",
                                "max_value": "100"
                            }
                        ]
                    },
                    {
                        "argument_type": "STRING",
                        "argument_size": 20,
                        "argument_description": "Test string argument",
                        "repeat_arg": "No"
                    }
                ]
            }
        ]
        
        print(f"Creating command stem: {self.test_command_stem}")
        print(f"Command data: {json.dumps(test_data[0], indent=2)}")
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
                command = res_data[0]
                self.assertEqual(command['command_stem'], self.test_command_stem)
                print("✓ RESULT: Command created successfully")
                print(f"  Command Stem: {command['command_stem']}")
                print(f"  Operations Category: {command['operations_category']}")
                print(f"  Arguments Count: {len(command.get('arguments', []))}")
            else:
                print("✓ RESULT: Command already exists (expected behavior)")
                
        except Exception as e:
            print(f"✗ RESULT: POST request failed with error: {e}")
            self.fail(f"POST request failed: {e}")

    def test_get_all_commands(self):
        """Test retrieving all commands"""
        print("\n" + "="*60)
        print("TEST 3: Get All Commands")
        print("="*60)
        print("Purpose: Test retrieving all commands with filtering")
        print("Expected: HTTP 200 (success) with array of commands")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds"
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Should return 200 for success
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            
            print(f"✓ RESULT: Successfully retrieved {len(res_data)} commands")
            if len(res_data) > 0:
                print(f"  Sample command stem: {res_data[0].get('command_stem', 'N/A')}")
                print(f"  Sample operations category: {res_data[0].get('operations_category', 'N/A')}")
                
            # Check for x-total-count header
            total_count = response.headers.get('x-total-count', 'N/A')
            print(f"  Total count (header): {total_count}")
            
            # Test with filtering
            print("  Testing with command_stem filter...")
            filter_path = f"{path}?command_stem={self.test_command_stem}"
            filter_response = requests.get(filter_path, headers=self.header, verify=False)
            print(f"  Filter response status: {filter_response.status_code}")
            if filter_response.status_code == 200:
                filter_data = filter_response.json()
                print(f"  Found {len(filter_data)} commands with stem '{self.test_command_stem}'")
                
        except Exception as e:
            print(f"✗ RESULT: GET request failed with error: {e}")
            self.fail(f"GET request failed: {e}")

    def test_get_specific_command(self):
        """Test getting a specific command by stem"""
        print("\n" + "="*60)
        print("TEST 4: Get Specific Command by Stem")
        print("="*60)
        print("Purpose: Test retrieving a specific command by command_stem")
        print("Expected: HTTP 200 (success) if exists, 404 if not found")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds/{self.test_command_stem}"
        print(f"Requesting command stem: {self.test_command_stem}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 if exists, 404 if not found
            self.assertIn(response.status_code, [200, 404])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertEqual(res_data['command_stem'], self.test_command_stem)
                print(f"✓ RESULT: Successfully retrieved command")
                print(f"  Command Stem: {res_data.get('command_stem', 'N/A')}")
                print(f"  Description: {res_data.get('cmd_description', 'N/A')}")
                print(f"  Operations Category: {res_data.get('operations_category', 'N/A')}")
                print(f"  Arguments: {len(res_data.get('arguments', []))}")
            else:
                print("✓ RESULT: Command not found (may have been cleaned up)")
                
        except Exception as e:
            print(f"✗ RESULT: GET specific command request failed with error: {e}")
            self.fail(f"GET specific command request failed: {e}")

    def test_update_command(self):
        """Test updating a command"""
        print("\n" + "="*60)
        print("TEST 5: Update Command")
        print("="*60)
        print("Purpose: Test updating a command via PATCH")
        print("Expected: HTTP 200 (success) if exists, 404 if not found")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds/{self.test_command_stem}"
        
        update_data = {
            "cmd_description": f"Updated command description - {self.test_id}",
            "operations_category": "UPDATED_CATEGORY",
            "restricted_modes": ["MODE1", "MODE2", "MODE3"]
        }
        
        print(f"Updating command stem: {self.test_command_stem}")
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
                self.assertEqual(res_data['cmd_description'], update_data['cmd_description'])
                self.assertEqual(res_data['operations_category'], update_data['operations_category'])
                print("✓ RESULT: Command updated successfully")
                print(f"  Updated description: {res_data.get('cmd_description', 'N/A')}")
                print(f"  Updated category: {res_data.get('operations_category', 'N/A')}")
                print(f"  Updated modes: {res_data.get('restricted_modes', [])}")
            else:
                print("✓ RESULT: Command not found for update")
                
        except Exception as e:
            print(f"✗ RESULT: PATCH request failed with error: {e}")
            self.fail(f"PATCH request failed: {e}")

    def test_bulk_query_commands(self):
        """Test bulk query for commands"""
        print("\n" + "="*60)
        print("TEST 6: Bulk Query Commands")
        print("="*60)
        print("Purpose: Test bulk querying commands by multiple stems")
        print("Expected: HTTP 200 with array of found commands")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds/bulk_query"
        
        # Query for our test command plus some non-existent ones
        command_stems = [self.test_command_stem, "NONEXISTENT_CMD_1", "NONEXISTENT_CMD_2"]
        
        print(f"Querying for command stems: {command_stems}")
        print(f"Sending POST request to: {path}")
        
        try:
            response = requests.post(path, json=command_stems, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 for bulk query
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            
            # Should return only the existing commands (0 to 1 in this case)
            self.assertLessEqual(len(res_data), 1)
            
            print(f"✓ RESULT: Bulk query successful, found {len(res_data)} commands out of {len(command_stems)} requested")
            
            if len(res_data) > 0:
                print(f"  Found commands: {[cmd.get('command_stem') for cmd in res_data]}")
            
        except Exception as e:
            print(f"✗ RESULT: Bulk query request failed with error: {e}")
            self.fail(f"Bulk query request failed: {e}")

    def test_get_nonexistent_command_404(self):
        """Test getting a non-existent command (should return 404)"""
        print("\n" + "="*60)
        print("TEST 7: Get Non-Existent Command (404 Test)")
        print("="*60)
        print("Purpose: Test retrieving a command that doesn't exist")
        print("Expected: HTTP 404 (not found)")
        
        nonexistent_stem = f"NONEXISTENT_CMD_{self.test_id}"
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds/{nonexistent_stem}"
        
        print(f"Testing non-existent command stem: {nonexistent_stem}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 404 for non-existent command
            self.assertEqual(response.status_code, 404)
            print("✓ RESULT: Correctly returned 404 for non-existent command")
            
        except Exception as e:
            print(f"✗ RESULT: GET non-existent command request failed with error: {e}")
            self.fail(f"GET non-existent command request failed: {e}")

    def test_delete_command(self):
        """Test deleting a command - FINAL TEST"""
        print("\n" + "="*60)
        print("TEST 8: Delete Command (FINAL TEST)")
        print("="*60)
        print("Purpose: Test deleting a command via DELETE")
        print("Expected: HTTP 204 (no content) if deleted, 404 if not found")
        print("⚠️  WARNING: This is the final destructive test!")
        
        path = f"{self.url}/dictionaries/{self.test_dictionary_type}/versions/{self.test_dictionary_version}/cmds/{self.test_command_stem}"
        print(f"Deleting command stem: {self.test_command_stem}")
        print(f"Sending DELETE request to: {path}")
        
        try:
            response = requests.delete(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 204 if deleted, 404 if not found
            self.assertIn(response.status_code, [204, 404])
            
            if response.status_code == 204:
                print(f"✓ RESULT: Command '{self.test_command_stem}' deleted successfully")
                
                # Verify deletion by trying to get the command
                print("  Verifying deletion...")
                verify_response = requests.get(path, headers=self.header, verify=False)
                print(f"  Verification GET status: {verify_response.status_code}")
                
                if verify_response.status_code == 404:
                    print("  ✓ Deletion confirmed - command no longer exists")
                else:
                    print("  ⚠️ Command may still exist after deletion")
                    
            else:
                print("✓ RESULT: Command not found for deletion")
                
        except Exception as e:
            print(f"✗ RESULT: DELETE request failed with error: {e}")
            self.fail(f"DELETE request failed: {e}")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "█"*80)
        print("🏁 DICTIONARY CONTENT API TEST SUITE COMPLETED")
        print("█"*80)
        print("All Dictionary Content API tests have been executed.")
        print("Note: This test covered Commands (cmds) endpoint.")
        print("Similar patterns apply to EVRs, Channels, and MIL1553 endpoints.")
        print("Check the results above for detailed test outcomes.")
        print("XML reports generated in: ./test-reports/")
        print("█"*80)

        # Clean up test dictionary
        cls._cleanup_test_dictionary()

    @classmethod
    def _cleanup_test_dictionary(cls):
        """Clean up the test dictionary"""
        print(f"\n🧹 Cleaning up test dictionary...")
        
        dict_path = f"{cls.url}/dictionaries/{cls.test_dictionary_type}/versions/{cls.test_dictionary_version}"
        
        try:
            response = requests.delete(dict_path, headers=cls.header, verify=False)
            if response.status_code == 204:
                print("✓ Test dictionary cleaned up successfully")
            else:
                print(f"⚠️ Dictionary cleanup returned {response.status_code}")
        except Exception as e:
            print(f"⚠️ Could not clean up test dictionary: {e}")

if __name__ == '__main__':
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output='test-reports'))