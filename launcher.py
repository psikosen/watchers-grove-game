#!/usr/bin/env python3
"""
The Watcher's Grove - Master Launcher
Provides a graphical interface to launch the game with various options
"""

import tkinter as tk
from tkinter import ttk, messagebox
import webbrowser
import os
import json
import subprocess
from datetime import datetime

class WatchersGroveLauncher:
    def __init__(self, root):
        self.root = root
        self.root.title("The Watcher's Grove - Launcher")
        self.root.geometry("600x500")
        self.root.configure(bg='#0a0a0a')
        
        # Style configuration
        self.style = ttk.Style()
        self.style.theme_use('clam')
        self.configure_styles()
        
        # Create UI
        self.create_widgets()
        
        # Load settings
        self.load_settings()
        
    def configure_styles(self):
        # Configure dark theme
        self.style.configure('Title.TLabel', 
                           background='#0a0a0a', 
                           foreground='#8b7355',
                           font=('Arial', 24, 'bold'))
        
        self.style.configure('Subtitle.TLabel',
                           background='#0a0a0a',
                           foreground='#b8a590',
                           font=('Arial', 12))
        
        self.style.configure('Game.TButton',
                           background='#8b7355',
                           foreground='#0a0a0a',
                           font=('Arial', 14, 'bold'),
                           borderwidth=0,
                           focuscolor='none')
        
        self.style.map('Game.TButton',
                      background=[('active', '#d4a574')],
                      foreground=[('active', '#0a0a0a')])
        
        self.style.configure('Option.TButton',
                           background='#1a1510',
                           foreground='#8b7355',
                           font=('Arial', 10),
                           borderwidth=1,
                           relief='solid')
        
    def create_widgets(self):
        # Title
        title_frame = tk.Frame(self.root, bg='#0a0a0a')
        title_frame.pack(pady=20)
        
        title = ttk.Label(title_frame, text="The Watcher's Grove", style='Title.TLabel')
        title.pack()
        
        subtitle = ttk.Label(title_frame, text="Ultimate Edition v3.0", style='Subtitle.TLabel')
        subtitle.pack()
        
        # Main buttons frame
        main_frame = tk.Frame(self.root, bg='#0a0a0a')
        main_frame.pack(expand=True, fill='both', padx=50, pady=20)
        
        # Play button
        play_btn = ttk.Button(main_frame, text="🎮 PLAY GAME", 
                             command=self.launch_game,
                             style='Game.TButton')
        play_btn.pack(fill='x', pady=10, ipady=15)
        
        # Quick launch options
        quick_frame = tk.Frame(main_frame, bg='#0a0a0a')
        quick_frame.pack(fill='x', pady=20)
        
        tk.Label(quick_frame, text="Quick Launch:", 
                bg='#0a0a0a', fg='#b8a590', 
                font=('Arial', 12)).pack(anchor='w')
        
        modes = [
            ("📖 Story Mode", "story"),
            ("💀 Survival Mode", "survival"),
            ("🧘 Zen Mode", "zen"),
            ("👹 Boss Rush", "boss")
        ]
        
        for text, mode in modes:
            btn = ttk.Button(quick_frame, text=text,
                           command=lambda m=mode: self.launch_with_mode(m),
                           style='Option.TButton')
            btn.pack(side='left', padx=5, pady=5)
        
        # Tools section
        tools_frame = tk.Frame(main_frame, bg='#0a0a0a')
        tools_frame.pack(fill='x', pady=20)
        
        tk.Label(tools_frame, text="Tools & Extras:", 
                bg='#0a0a0a', fg='#b8a590',
                font=('Arial', 12)).pack(anchor='w')
        
        tools = [
            ("📊 Statistics", self.open_stats),
            ("📚 Guide", self.open_guide),
            ("🛠️ Level Editor", self.open_editor),
            ("⚙️ Settings", self.open_settings)
        ]
        
        tools_grid = tk.Frame(tools_frame, bg='#0a0a0a')
        tools_grid.pack(fill='x')
        
        for i, (text, command) in enumerate(tools):
            btn = ttk.Button(tools_grid, text=text,
                           command=command,
                           style='Option.TButton')
            btn.grid(row=i//2, column=i%2, padx=5, pady=5, sticky='ew')
        
        tools_grid.columnconfigure(0, weight=1)
        tools_grid.columnconfigure(1, weight=1)
        
        # Options
        options_frame = tk.Frame(main_frame, bg='#0a0a0a')
        options_frame.pack(fill='x', pady=10)
        
        self.sound_var = tk.BooleanVar(value=True)
        sound_check = tk.Checkbutton(options_frame, text="🔊 Enable Sound",
                                    variable=self.sound_var,
                                    bg='#0a0a0a', fg='#b8a590',
                                    selectcolor='#0a0a0a',
                                    font=('Arial', 10))
        sound_check.pack(side='left', padx=10)
        
        self.fullscreen_var = tk.BooleanVar(value=False)
        fullscreen_check = tk.Checkbutton(options_frame, text="🖥️ Fullscreen",
                                         variable=self.fullscreen_var,
                                         bg='#0a0a0a', fg='#b8a590',
                                         selectcolor='#0a0a0a',
                                         font=('Arial', 10))
        fullscreen_check.pack(side='left', padx=10)
        
        # Status bar
        status_frame = tk.Frame(self.root, bg='#1a1510', height=30)
        status_frame.pack(fill='x', side='bottom')
        
        self.status_label = tk.Label(status_frame, 
                                   text="Ready to enter the grove...",
                                   bg='#1a1510', fg='#8b7355',
                                   font=('Arial', 9))
        self.status_label.pack(side='left', padx=10)
        
        # Version info
        version_label = tk.Label(status_frame,
                               text="v3.0 Ultimate | © 2024",
                               bg='#1a1510', fg='#666',
                               font=('Arial', 8))
        version_label.pack(side='right', padx=10)
        
    def launch_game(self):
        self.update_status("Launching The Watcher's Grove...")
        url = "file://" + os.path.abspath("index.html")
        
        # Add parameters
        params = []
        if not self.sound_var.get():
            params.append("mute=1")
        if self.fullscreen_var.get():
            params.append("fullscreen=1")
        
        if params:
            url += "?" + "&".join(params)
        
        webbrowser.open(url)
        self.save_launch_stats()
        self.update_status("Game launched! The grove awaits...")
        
    def launch_with_mode(self, mode):
        self.update_status(f"Launching {mode} mode...")
        url = f"file://{os.path.abspath('index.html')}?mode={mode}"
        
        if not self.sound_var.get():
            url += "&mute=1"
            
        webbrowser.open(url)
        self.save_launch_stats(mode)
        
    def open_stats(self):
        self.update_status("Opening statistics dashboard...")
        webbrowser.open(f"file://{os.path.abspath('stats-dashboard.html')}")
        
    def open_guide(self):
        self.update_status("Opening game guide...")
        webbrowser.open(f"file://{os.path.abspath('quick-start.html')}")
        
    def open_editor(self):
        self.update_status("Launching level editor...")
        webbrowser.open(f"file://{os.path.abspath('index.html')}?editor=1")
        
    def open_settings(self):
        # Create settings window
        settings_win = tk.Toplevel(self.root)
        settings_win.title("Settings")
        settings_win.geometry("400x300")
        settings_win.configure(bg='#0a0a0a')
        
        tk.Label(settings_win, text="Game Settings",
                bg='#0a0a0a', fg='#8b7355',
                font=('Arial', 16, 'bold')).pack(pady=10)
        
        # Settings options
        settings_frame = tk.Frame(settings_win, bg='#0a0a0a')
        settings_frame.pack(expand=True, fill='both', padx=20)
        
        # Difficulty
        tk.Label(settings_frame, text="Default Difficulty:",
                bg='#0a0a0a', fg='#b8a590').pack(anchor='w', pady=5)
        
        self.difficulty_var = tk.StringVar(value="adept")
        difficulties = ["novice", "adept", "master", "elder"]
        
        for diff in difficulties:
            tk.Radiobutton(settings_frame, text=diff.capitalize(),
                          variable=self.difficulty_var, value=diff,
                          bg='#0a0a0a', fg='#b8a590',
                          selectcolor='#1a1510').pack(anchor='w', padx=20)
        
        # Season
        tk.Label(settings_frame, text="Default Season:",
                bg='#0a0a0a', fg='#b8a590').pack(anchor='w', pady=(20,5))
        
        self.season_var = tk.StringVar(value="default")
        seasons = ["default", "autumn", "winter", "spring", "summer", "halloween"]
        
        season_combo = ttk.Combobox(settings_frame, textvariable=self.season_var,
                                   values=seasons, state='readonly', width=20)
        season_combo.pack(anchor='w', padx=20)
        
        # Save button
        save_btn = ttk.Button(settings_frame, text="Save Settings",
                            command=self.save_settings,
                            style='Option.TButton')
        save_btn.pack(pady=20)
        
    def update_status(self, text):
        self.status_label.config(text=text)
        self.root.update()
        
    def save_launch_stats(self, mode=None):
        # Track launches
        try:
            stats_file = "launcher_stats.json"
            if os.path.exists(stats_file):
                with open(stats_file, 'r') as f:
                    stats = json.load(f)
            else:
                stats = {"launches": 0, "modes": {}}
            
            stats["launches"] += 1
            stats["last_launch"] = datetime.now().isoformat()
            
            if mode:
                if mode not in stats["modes"]:
                    stats["modes"][mode] = 0
                stats["modes"][mode] += 1
            
            with open(stats_file, 'w') as f:
                json.dump(stats, f, indent=2)
                
        except Exception as e:
            print(f"Error saving stats: {e}")
            
    def load_settings(self):
        try:
            if os.path.exists("launcher_settings.json"):
                with open("launcher_settings.json", 'r') as f:
                    settings = json.load(f)
                    self.sound_var.set(settings.get("sound", True))
                    self.fullscreen_var.set(settings.get("fullscreen", False))
        except:
            pass
            
    def save_settings(self):
        settings = {
            "sound": self.sound_var.get(),
            "fullscreen": self.fullscreen_var.get(),
            "difficulty": getattr(self, 'difficulty_var', tk.StringVar(value="adept")).get(),
            "season": getattr(self, 'season_var', tk.StringVar(value="default")).get()
        }
        
        with open("launcher_settings.json", 'w') as f:
            json.dump(settings, f, indent=2)
            
        messagebox.showinfo("Settings", "Settings saved successfully!")

def main():
    # Check if game files exist
    if not os.path.exists("index.html"):
        messagebox.showerror("Error", "Game files not found! Please ensure index.html is in the same directory.")
        return
        
    root = tk.Tk()
    app = WatchersGroveLauncher(root)
    
    # Center window
    root.update_idletasks()
    x = (root.winfo_screenwidth() // 2) - (600 // 2)
    y = (root.winfo_screenheight() // 2) - (500 // 2)
    root.geometry(f"+{x}+{y}")
    
    root.mainloop()

if __name__ == "__main__":
    main()