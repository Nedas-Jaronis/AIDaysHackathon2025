# SolSearch

SolSearch helps identify the best land for solar energy development. It analyzes terrain, sunlight, and grid proximity, then applies AI-powered predictions to highlight high-potential solar sites. Ideal for landowners, developers, and policymakers who want fast, data-driven insights for sustainable planning.

## Key Features

- Land suitability scoring based on solar irradiance, slope, elevation, and distance to power grids
- AI-driven insights and future solar potential trends
- Interactive map for exploring parcels
- Fast comparisons between candidate sites
- Sustainability-focused decision support

## Installation & Setup 

This section contains instructions on cloning and running this repository.

1. Clone the repository

    ```shell
    git clone https://github.com/Nedas-Jaronis/AIDaysHackathon2025
    cd AIDaysHackathon2025/
    ```

2. Create a virtual environment.

    ```shell
    cd SuitableSolar/backend/
    python -m venv .venv
    ```

3. Activate the virtual environment.
    - If you are Mac/Linux, run

        ```shell
        source ./.venv/bin/activate/
        ```

    - If you are on Windows, run

        ```shell
        .\venv\Scripts\activate
        ```

4. Install the project requirements.

    ```shell
    pip install -r requirements.txt
    ```

5. Run the server.

    ```shell
    uvicorn server:app --reload
    ```

6. `server.py` will prompt you to enter a state abbreviation and the number of years to forecast in the future. Enter the desired values and continue. The example below models California's power usage over the next 20 years.

    ```plain
    CA
    20
    ```

7. In another terminal, head to the project directory and run the frontend.

    ```shell
    cd AIDaysHackathon2025/SuitableSolar/src/
    npm install
    npm run dev
    ```

8. Open the website at http://localhost:5173
