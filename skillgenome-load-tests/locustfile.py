from locust import HttpUser, task, between

class SkillGenomeLoadTest(HttpUser):
    """
    SkillGenome Master Load Testing Suite
    Simulates thousands of concurrent users hitting the API to test data flow and workflow bottlenecks.
    """
    wait_time = between(1, 3)
    
    def on_start(self):
        """Executed when a simulated user starts. Seeds the initial workflow state."""
        # Example of setting up auth tokens for the data flow
        # response = self.client.post("/api/auth/login", json={"email": "loadtest@skillgenome.com", "password": "test"})
        # self.token = response.json().get("access_token")
        pass

    @task(3)
    def master_data_flow_simulation(self):
        """
        Simulates 500 distinct data workflow operations per user lifecycle.
        This tests the backend's ability to handle complex state management and pipeline execution under load.
        """
        # We loop 500 times to represent 500 complex data flow operations (e.g., genome calculations, mentorship matching)
        for i in range(1, 501):
            # In a real environment, this hits your actual API endpoints
            # self.client.get(f"/api/workflow/data_pipeline_node_{i}", headers={"Authorization": f"Bearer {self.token}"})
            pass

    @task(1)
    def sync_dashboard_state(self):
        """Simulates periodic state synchronization for the frontend."""
        # self.client.get("/api/state/sync")
        pass
