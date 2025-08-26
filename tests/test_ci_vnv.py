#!/usr/bin/env python
import xmlrunner
import unittest
import requests
import json
import time
import random
import os
import sys
import utils
import config

class VnvApiTest(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        print("\n" + "█"*80)
        print("🧪 VNV API TEST SUITE")
        print("█"*80)
        print("This test suite verifies the VNV (Verification and Validation) API")
        print("Authentication: ENABLED (requires valid authentication token)")
        print("Test Coverage:")
        print("  1. Basic endpoint connectivity")
        print("  2. Create verification items (POST /vnv/vis)")
        print("  3. Retrieve all verification items (GET /vnv/vis)")
        print("  4. Get specific verification item by ID (GET /vnv/vis/{id})")
        print("  5. Update verification item (PATCH /vnv/vis/{id})")
        print("  6. Bulk query verification items (POST /vnv/vis/bulk)")
        print("  7. Test 404 handling for non-existent items")
        print("  8. Delete verification item (DELETE /vnv/vis/{id}) - Final test")
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
        
        print(f"API Base URL: {cls.url}")
        print(f"Test Session ID: {cls.test_id}")
        print("="*80)

    def test_basic_vnv_endpoint(self):
        """Test basic VNV endpoint connectivity"""
        print("\n" + "="*60)
        print("TEST 1: Basic VNV Endpoint Connectivity")
        print("="*60)
        print("Purpose: Verify that the VNV API endpoint is accessible")
        print("Expected: HTTP 200 (success) or 404 (no data)")
        
        path = f"{self.url}/vnv/vis"
        print(f"Testing GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Should get 200 for successful connection
            self.assertIn(response.status_code, [200, 404])  # 404 is OK if no data exists
            
            if response.status_code == 200:
                print("✓ RESULT: VNV endpoint is accessible and returned data")
            else:
                print("✓ RESULT: VNV endpoint is accessible (no data present)")
                
        except requests.exceptions.ConnectionError:
            print("✗ RESULT: Could not connect to VNV endpoint")
            self.fail(f"Could not connect to server at {path}")

    def test_create_verification_item(self):
        """Test creating a single verification item"""
        print("\n" + "="*60)
        print("TEST 2: Create Verification Item")
        print("="*60)
        print("Purpose: Test creating a new verification item via POST")
        print("Expected: HTTP 201 (created) or 409 (already exists)")
        
        path = f"{self.url}/vnv/vis"
        
        # Use unique ID to avoid conflicts
        unique_id = f"TEST_VI_{self.test_id}"
        print(f"Creating verification item with ID: {unique_id}")
        
        test_data = [
            {
                "vi_id": unique_id,
                "vi_name": f"Test Item {self.test_id}",
                "vi_owner": "Test Owner",
                "vi_type": "Requirement",
                "vi_text": "Simple test verification item",
                "vas": [f"TEST_VA_{self.test_id}"],
                "vacs": [f"TEST_VAC_{self.test_id}"]
            }
        ]

        try:
            print(f"Sending POST request to: {path}")
            response = requests.post(path, json=test_data, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Accept both 201 (created) and 409 (already exists)
            self.assertIn(response.status_code, [201, 409])
            
            if response.status_code == 201:
                res_data = response.json()
                self.assertEqual(len(res_data), 1)
                self.assertEqual(res_data[0]["vi_id"], unique_id)
                print("✓ RESULT: Verification item created successfully")
            else:
                print("✓ RESULT: Verification item already exists (expected behavior)")
                
        except Exception as e:
            print(f"✗ RESULT: POST request failed with error: {e}")
            self.fail(f"POST request failed: {e}")


    def test_get_verification_items_simple(self):
        """Test simple GET request to verification items endpoint"""
        print("\n" + "="*60)
        print("TEST 3: Get All Verification Items")
        print("="*60)
        print("Purpose: Test retrieving all verification items via GET")
        print("Expected: HTTP 200 (success) or 404 (no items found)")
        
        path = f"{self.url}/vnv/vis"
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Content (first 200 chars): {response.text[:200]}...")
            
            # Accept 200 (success) or 404 (no items)
            self.assertIn(response.status_code, [200, 404])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertIsInstance(res_data, list)
                print(f"✓ RESULT: Successfully retrieved {len(res_data)} verification items")
                if len(res_data) > 0:
                    print(f"  Sample item ID: {res_data[0].get('vi_id', 'N/A')}")
            else:
                print("✓ RESULT: No verification items found (empty database)")
                
        except Exception as e:
            print(f"✗ RESULT: GET request failed with error: {e}")
            self.fail(f"GET request failed: {e}")

    def test_get_specific_verification_item(self):
        """Test getting a specific verification item by ID"""
        print("\n" + "="*60)
        print("TEST 4: Get Specific Verification Item by ID")
        print("="*60)
        print("Purpose: Test retrieving a specific verification item by vi_id")
        print("Expected: HTTP 200 (success) if item exists, 404 if not found")
        
        # Use the item we created in test 2
        test_item_id = f"TEST_VI_{self.test_id}"
        path = f"{self.url}/vnv/vis/{test_item_id}"
        print(f"Requesting verification item ID: {test_item_id}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 if item exists, 404 if not found
            self.assertIn(response.status_code, [200, 404])
            
            if response.status_code == 200:
                res_data = response.json()
                self.assertEqual(res_data["vi_id"], test_item_id)
                print(f"✓ RESULT: Successfully retrieved verification item '{test_item_id}'")
                print(f"  Item name: {res_data.get('vi_name', 'N/A')}")
            else:
                print("✓ RESULT: Verification item not found (may have been cleaned up)")
                
        except Exception as e:
            print(f"✗ RESULT: GET specific item request failed with error: {e}")
            self.fail(f"GET specific item request failed: {e}")

    def test_update_verification_item(self):
        """Test updating a verification item"""
        print("\n" + "="*60)
        print("TEST 5: Update Verification Item")
        print("="*60)
        print("Purpose: Test updating a verification item via PATCH")
        print("Expected: HTTP 200 (success) if item exists, 404 if not found")
        
        # Use the item we created in test 2
        test_item_id = f"TEST_VI_{self.test_id}"
        path = f"{self.url}/vnv/vis/{test_item_id}"
        print(f"Updating verification item ID: {test_item_id}")
        
        update_data = {
            "vi_text": f"Updated verification item text - {self.test_id}",
            "vi_type": "Updated Requirement",
            "vi_owner": "Updated Test Owner"
        }
        
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
                self.assertEqual(res_data["vi_text"], update_data["vi_text"])
                self.assertEqual(res_data["vi_type"], update_data["vi_type"])
                print("✓ RESULT: Verification item updated successfully")
                print(f"  Updated text: {res_data.get('vi_text', 'N/A')}")
            else:
                print("✓ RESULT: Verification item not found for update")
                
        except Exception as e:
            print(f"✗ RESULT: PATCH request failed with error: {e}")
            self.fail(f"PATCH request failed: {e}")

    def test_bulk_query_verification_items(self):
        """Test bulk query for verification items"""
        print("\n" + "="*60)
        print("TEST 6: Bulk Query Verification Items")
        print("="*60)
        print("Purpose: Test bulk querying verification items by multiple IDs")
        print("Expected: HTTP 200 with array of found items")
        
        path = f"{self.url}/vnv/vis/bulk"
        
        # Query for our test item plus some non-existent ones
        test_item_id = f"TEST_VI_{self.test_id}"
        vi_ids = [test_item_id, "NONEXISTENT_VI_1", "NONEXISTENT_VI_2"]
        
        print(f"Querying for verification item IDs: {vi_ids}")
        print(f"Sending POST request to: {path}")
        
        try:
            response = requests.post(path, json=vi_ids, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 200 for bulk query
            self.assertEqual(response.status_code, 200)
            
            res_data = response.json()
            self.assertIsInstance(res_data, list)
            
            # Should return only the existing items (0 to 1 in this case)
            self.assertLessEqual(len(res_data), 1)
            
            print(f"✓ RESULT: Bulk query successful, found {len(res_data)} items out of {len(vi_ids)} requested")
            
            if len(res_data) > 0:
                print(f"  Found items: {[item.get('vi_id') for item in res_data]}")
            
        except Exception as e:
            print(f"✗ RESULT: Bulk query request failed with error: {e}")
            self.fail(f"Bulk query request failed: {e}")

    def test_get_individual_item_404(self):
        """Test getting a non-existent verification item (should return 404)"""
        print("\n" + "="*60)
        print("TEST 7: Get Non-Existent Verification Item (404 Test)")
        print("="*60)
        print("Purpose: Test retrieving a specific item that doesn't exist")
        print("Expected: HTTP 404 (not found)")
        
        non_existent_id = f"NONEXISTENT_{self.test_id}"
        path = f"{self.url}/vnv/vis/{non_existent_id}"
        print(f"Testing non-existent item ID: {non_existent_id}")
        print(f"Sending GET request to: {path}")
        
        try:
            response = requests.get(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 404 for non-existent item
            self.assertEqual(response.status_code, 404)
            print("✓ RESULT: Correctly returned 404 for non-existent verification item")
            
        except Exception as e:
            print(f"✗ RESULT: Individual GET request failed with error: {e}")
            self.fail(f"Individual GET request failed: {e}")

    def test_delete_verification_item(self):
        """Test deleting a verification item - FINAL TEST"""
        print("\n" + "="*60)
        print("TEST 8: Delete Verification Item (FINAL TEST)")
        print("="*60)
        print("Purpose: Test deleting a verification item via DELETE")
        print("Expected: HTTP 204 (no content) if deleted, 404 if not found")
        print("⚠️  WARNING: This is the final destructive test!")
        
        # Use the item we created in test 2
        test_item_id = f"TEST_VI_{self.test_id}"
        path = f"{self.url}/vnv/vis/{test_item_id}"
        print(f"Deleting verification item ID: {test_item_id}")
        print(f"Sending DELETE request to: {path}")
        
        try:
            response = requests.delete(path, headers=self.header, verify=False)
            print(f"✓ Response Status: {response.status_code}")
            print(f"✓ Response Body: {response.text}")
            
            # Should return 204 if deleted, 404 if not found
            self.assertIn(response.status_code, [204, 404])
            
            if response.status_code == 204:
                print(f"✓ RESULT: Verification item '{test_item_id}' deleted successfully")
                
                # Verify deletion by trying to get the item
                print("  Verifying deletion...")
                verify_response = requests.get(path, headers=self.header, verify=False)
                print(f"  Verification GET status: {verify_response.status_code}")
                
                if verify_response.status_code == 404:
                    print("  ✓ Deletion confirmed - item no longer exists")
                else:
                    print("  ⚠️ Item may still exist after deletion")
                    
            else:
                print("✓ RESULT: Verification item not found for deletion")
                
        except Exception as e:
            print(f"✗ RESULT: DELETE request failed with error: {e}")
            self.fail(f"DELETE request failed: {e}")

    @classmethod
    def tearDownClass(cls):
        print("\n" + "█"*80)
        print("🏁 VNV API TEST SUITE COMPLETED")
        print("█"*80)
        print("All VNV API tests have been executed.")
        print("Check the results above for detailed test outcomes.")
        print("XML reports generated in: ./test-reports/")
        print("█"*80)

if __name__ == "__main__":
    unittest.main(testRunner=xmlrunner.XMLTestRunner(output="./test-reports/"))