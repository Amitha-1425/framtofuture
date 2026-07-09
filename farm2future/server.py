import http.server
import socketserver
import socket
import webbrowser

def find_free_port():
    with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
        s.bind(('', 0))
        s.setsockopt(socket.SOL_SOCKET, socket.SO_REUSEADDR, 1)
        return s.getsockname()[1]

if __name__ == "__main__":
    PORT = find_free_port()
    Handler = http.server.SimpleHTTPRequestHandler

    with socketserver.TCPServer(("", PORT), Handler) as httpd:
        print(f"Serving at port {PORT}")
        print(f"Opening browser at http://localhost:{PORT}")
        webbrowser.open_new_tab(f"http://localhost:{PORT}")
        httpd.serve_forever()
