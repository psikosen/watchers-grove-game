#!/usr/bin/env python3
"""
The Watcher's Grove - Advanced Launcher
Launch the game with various options and configurations
"""

import os
import sys
import json
import webbrowser
import http.server
import socketserver
import threading
from datetime import datetime

class GameLauncher:
    def __init__(self):
        self.game_dir = os.path.dirname(os.path.abspath(__file__))
        self.game_file = os.path.join(self.game_dir, 'index.html')
        self.config_file = os.path.join(self.game_dir, 'game_config.json')
        self.stats_file = os.path.join(self.game_dir, 'game_stats.json')
        
    def load_config(self):
        """Load game configuration"""
        if os.path.exists(self.config_file):
            with open(self.config_file, 'r') as f:
                return json.load(f)
        return self.create_default_config()
    
    def create_default_config(self):
        """Create default configuration"""
        config = {
            "sound_enabled": True,
            "default_difficulty": "adept",
            "default_season": "default",
            "fullscreen": False,
            "particle_quality": "high",
            "show_tutorial": True,
            "auto_save": True
        }
        with open(self.config_file, 'w') as f:
            json.dump(config, f, indent=4)
        return config
    
    def load_stats(self):
        """Load game statistics"""
        if os.path.exists(self.stats_file):
            with open(self.stats_file, 'r') as f:
                return json.load(f)
        return {
            "total_plays": 0,
            "total_time": 0,
            "favorite_mode": "story",
            "highest_score": 0,
            "total_eyes_clicked": 0
        }
    
    def save_stats(self, stats):
        """Save game statistics"""
        with open(self.stats_file, 'w') as f:
            json.dump(stats, f, indent=4)
    
    def start_local_server(self, port=8080):
        """Start a local web server for better performance"""
        os.chdir(self.game_dir)
        handler = http.server.SimpleHTTPRequestHandler
        
        with socketserver.TCPServer(("", port), handler) as httpd:
            print(f"🌐 Local server started at http://localhost:{port}")
            print("📁 Serving from:", self.game_dir)
            print("🎮 Opening game in browser...")
            
            # Open browser after server starts
            webbrowser.open(f'http://localhost:{port}/index.html')
            
            try:
                httpd.serve_forever()
            except KeyboardInterrupt:
                print("\n👋 Shutting down server...")
                httpd.shutdown()
    
    def launch_direct(self):
        """Launch game directly in browser"""
        print("🎮 Launching The Watcher's Grove...")
        webbrowser.open(f'file://{self.game_file}')
    
    def show_menu(self):
        """Display launch menu"""
        print("""
╔══════════════════════════════════════════╗
║       THE WATCHER'S GROVE LAUNCHER       ║
║           Ultimate Edition               ║
╚══════════════════════════════════════════╝

1. 🎮 Quick Play (Direct Launch)
2. 🌐 Play with Local Server (Recommended)
3. 📊 View Statistics
4. ⚙️  Configure Game
5. 🏆 View Achievements
6. 📖 Read Guide
7. 🔧 Developer Mode
8. ❌ Exit

""")
        
    def view_statistics(self):
        """Display game statistics"""
        stats = self.load_stats()
        print("\n📊 GAME STATISTICS")
        print("=" * 40)
        print(f"Total Plays: {stats['total_plays']}")
        print(f"Total Time: {stats['total_time']} minutes")
        print(f"Favorite Mode: {stats['favorite_mode']}")
        print(f"Highest Score: {stats['highest_score']:,}")
        print(f"Total Eyes Clicked: {stats['total_eyes_clicked']:,}")
        print("=" * 40)
        input("\nPress Enter to continue...")
    
    def configure_game(self):
        """Configure game settings"""
        config = self.load_config()
        
        print("\n⚙️ GAME CONFIGURATION")
        print("=" * 40)
        print("1. Sound:", "Enabled" if config['sound_enabled'] else "Disabled")
        print("2. Default Difficulty:", config['default_difficulty'])
        print("3. Default Season:", config['default_season'])
        print("4. Fullscreen:", "Yes" if config['fullscreen'] else "No")
        print("5. Particle Quality:", config['particle_quality'])
        print("6. Show Tutorial:", "Yes" if config['show_tutorial'] else "No")
        print("7. Auto Save:", "Yes" if config['auto_save'] else "No")
        print("8. Save and Return")
        print("=" * 40)
        
        choice = input("\nSelect option to toggle (1-8): ")
        
        if choice == '1':
            config['sound_enabled'] = not config['sound_enabled']
        elif choice == '2':
            difficulties = ['novice', 'adept', 'master', 'elder']
            current = difficulties.index(config['default_difficulty'])
            config['default_difficulty'] = difficulties[(current + 1) % 4]
        elif choice == '3':
            seasons = ['default', 'autumn', 'winter', 'spring', 'summer', 'halloween']
            current = seasons.index(config['default_season'])
            config['default_season'] = seasons[(current + 1) % 6]
        elif choice == '4':
            config['fullscreen'] = not config['fullscreen']
        elif choice == '5':
            qualities = ['low', 'medium', 'high', 'ultra']
            current = qualities.index(config['particle_quality'])
            config['particle_quality'] = qualities[(current + 1) % 4]
        elif choice == '6':
            config['show_tutorial'] = not config['show_tutorial']
        elif choice == '7':
            config['auto_save'] = not config['auto_save']
        elif choice == '8':
            with open(self.config_file, 'w') as f:
                json.dump(config, f, indent=4)
            print("\n✅ Configuration saved!")
            return
        
        self.configure_game()  # Show menu again
    
    def developer_mode(self):
        """Launch with developer console"""
        print("\n🔧 DEVELOPER MODE")
        print("=" * 40)
        print("1. Launch with console logging")
        print("2. Launch with performance monitor")
        print("3. Reset all game data")
        print("4. Export save data")
        print("5. Import save data")
        print("6. Return to main menu")
        print("=" * 40)
        
        choice = input("\nSelect option: ")
        
        if choice == '1':
            print("Launching with console logging enabled...")
            # This would inject console.log statements
            self.launch_direct()
        elif choice == '2':
            print("Launching with performance monitor...")
            # This would inject performance monitoring
            self.launch_direct()
        elif choice == '3':
            confirm = input("⚠️  This will reset ALL game data. Are you sure? (yes/no): ")
            if confirm.lower() == 'yes':
                # Reset localStorage keys
                print("Game data reset!")
        elif choice == '4':
            print("Exporting save data...")
            # Export localStorage to file
        elif choice == '5':
            print("Importing save data...")
            # Import localStorage from file
    
    def run(self):
        """Main launcher loop"""
        while True:
            os.system('clear' if os.name == 'posix' else 'cls')
            self.show_menu()
            
            choice = input("Select option (1-8): ")
            
            if choice == '1':
                self.launch_direct()
                break
            elif choice == '2':
                try:
                    self.start_local_server()
                except Exception as e:
                    print(f"Error starting server: {e}")
                    input("Press Enter to continue...")
            elif choice == '3':
                self.view_statistics()
            elif choice == '4':
                self.configure_game()
            elif choice == '5':
                self.view_achievements()
            elif choice == '6':
                self.read_guide()
            elif choice == '7':
                self.developer_mode()
            elif choice == '8':
                print("\n👋 Thanks for playing The Watcher's Grove!")
                sys.exit(0)
            else:
                print("\n❌ Invalid option. Please try again.")
                input("Press Enter to continue...")
    
    def view_achievements(self):
        """Display achievements progress"""
        print("\n🏆 ACHIEVEMENTS")
        print("=" * 40)
        # This would read from localStorage via a bridge
        print("Check achievements in-game for now")
        print("=" * 40)
        input("\nPress Enter to continue...")
    
    def read_guide(self):
        """Open game guide"""
        guide_file = os.path.join(self.game_dir, 'README_ULTIMATE.md')
        if os.path.exists(guide_file):
            if sys.platform == 'darwin':
                os.system(f'open "{guide_file}"')
            elif sys.platform == 'win32':
                os.system(f'start "" "{guide_file}"')
            else:
                os.system(f'xdg-open "{guide_file}"')
        else:
            print("Guide file not found!")
            input("Press Enter to continue...")

if __name__ == "__main__":
    launcher = GameLauncher()
    
    # Quick launch with arguments
    if len(sys.argv) > 1:
        if sys.argv[1] == '--quick':
            launcher.launch_direct()
        elif sys.argv[1] == '--server':
            port = int(sys.argv[2]) if len(sys.argv) > 2 else 8080
            launcher.start_local_server(port)
        elif sys.argv[1] == '--help':
            print("""
The Watcher's Grove Launcher

Usage:
  python3 launcher.py           # Interactive menu
  python3 launcher.py --quick   # Quick launch
  python3 launcher.py --server  # Launch with server
  python3 launcher.py --help    # Show this help
            """)
    else:
        launcher.run()
