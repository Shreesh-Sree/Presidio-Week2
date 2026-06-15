from app import create_app

app = create_app()

if __name__ == '__main__':
    print("===================================================")
    print(" Python Flask server is running on port 5000")
    print(" API Base URL: http://localhost:5000")
    print("===================================================")
    app.run(host='0.0.0.0', port=5000, debug=True)
