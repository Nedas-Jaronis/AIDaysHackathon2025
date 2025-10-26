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
    git clone git@github.com:Nedas-Jaronis/AIDaysHackathon2025.git
    cd AIDaysHackathon2025/
    ```

2. Start the backend

    ```shell
    cd SuitableSolar/backend/
    python -m venv .venv
    pip install -r requirements.txt
    uvicorn main:app --reload
    ```

3. `server.py` will prompt you to enter a state abbreviation and the number of years to forecast in the future. Enter the desired values and continue. The example below models California's power usage over the next 20 years.

    ```plain
    CA
    20
    ```

4. Start the frontend

    ```shell
    cd SuitableSolar/src/
    npm install
    npm run dev
    ```

5. Open the website at http://localhost:5173
