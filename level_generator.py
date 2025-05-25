#!/usr/bin/env python3
"""
The Watcher's Grove - Level Pack Generator
Generates themed level packs for the game
"""

import json
import random
import math
from datetime import datetime

class LevelPackGenerator:
    def __init__(self):
        self.patterns = {
            'spiral': self.generate_spiral,
            'mandala': self.generate_mandala,
            'constellation': self.generate_constellation,
            'fibonacci': self.generate_fibonacci,
            'pentagram': self.generate_pentagram,
            'tree_of_life': self.generate_tree_of_life,
            'chaos': self.generate_chaos,
            'labyrinth': self.generate_labyrinth
        }
    
    def generate_spiral(self, num_eyes, center_x=400, center_y=300):
        """Generate a spiral pattern"""
        eyes = []
        for i in range(num_eyes):
            angle = i * 0.5
            radius = 20 + i * 15
            x = center_x + math.cos(angle) * radius
            y = center_y + math.sin(angle) * radius
            eyes.append({'x': int(x), 'y': int(y)})
        return eyes
    
    def generate_mandala(self, num_eyes, center_x=400, center_y=300):
        """Generate a mandala pattern"""
        eyes = []
        rings = 3
        eyes_per_ring = num_eyes // rings
        
        for ring in range(rings):
            radius = 80 + ring * 80
            for i in range(eyes_per_ring):
                angle = (2 * math.pi / eyes_per_ring) * i
                x = center_x + math.cos(angle) * radius
                y = center_y + math.sin(angle) * radius
                eyes.append({'x': int(x), 'y': int(y)})
        
        return eyes
    
    def generate_constellation(self, num_eyes, center_x=400, center_y=300):
        """Generate constellation-like clusters"""
        eyes = []
        clusters = 4
        eyes_per_cluster = num_eyes // clusters
        
        for cluster in range(clusters):
            cluster_angle = (2 * math.pi / clusters) * cluster
            cluster_x = center_x + math.cos(cluster_angle) * 150
            cluster_y = center_y + math.sin(cluster_angle) * 150
            
            for i in range(eyes_per_cluster):
                angle = random.random() * 2 * math.pi
                radius = random.random() * 50
                x = cluster_x + math.cos(angle) * radius
                y = cluster_y + math.sin(angle) * radius
                eyes.append({'x': int(x), 'y': int(y)})
        
        return eyes
    
    def generate_fibonacci(self, num_eyes, center_x=400, center_y=300):
        """Generate Fibonacci spiral pattern"""
        eyes = []
        golden_angle = math.pi * (3 - math.sqrt(5))  # Golden angle in radians
        
        for i in range(num_eyes):
            angle = i * golden_angle
            radius = 10 * math.sqrt(i)
            x = center_x + math.cos(angle) * radius
            y = center_y + math.sin(angle) * radius
            eyes.append({'x': int(x), 'y': int(y)})
        
        return eyes
    
    def generate_pentagram(self, num_eyes, center_x=400, center_y=300):
        """Generate pentagram pattern"""
        eyes = []
        
        # Outer pentagram points
        for i in range(5):
            angle = (2 * math.pi / 5) * i - math.pi / 2
            x = center_x + math.cos(angle) * 150
            y = center_y + math.sin(angle) * 150
            eyes.append({'x': int(x), 'y': int(y)})
        
        # Inner pentagon
        for i in range(5):
            angle = (2 * math.pi / 5) * i
            x = center_x + math.cos(angle) * 60
            y = center_y + math.sin(angle) * 60
            eyes.append({'x': int(x), 'y': int(y)})
        
        # Fill remaining with circular pattern
        remaining = num_eyes - 10
        for i in range(remaining):
            angle = (2 * math.pi / remaining) * i
            radius = 100
            x = center_x + math.cos(angle) * radius
            y = center_y + math.sin(angle) * radius
            eyes.append({'x': int(x), 'y': int(y)})
        
        return eyes
    
    def generate_tree_of_life(self, num_eyes, center_x=400, center_y=300):
        """Generate Tree of Life pattern"""
        eyes = []
        levels = 4
        
        # Trunk
        for i in range(3):
            y = center_y + 100 - i * 50
            eyes.append({'x': center_x, 'y': int(y)})
        
        # Branches
        for level in range(levels):
            y = center_y - 50 - level * 60
            spread = 30 + level * 40
            branches = min(3 + level, num_eyes - len(eyes))
            
            for i in range(branches):
                if len(eyes) >= num_eyes:
                    break
                x = center_x - spread + (2 * spread / max(branches - 1, 1)) * i
                eyes.append({'x': int(x), 'y': int(y)})
        
        return eyes[:num_eyes]
    
    def generate_chaos(self, num_eyes, center_x=400, center_y=300):
        """Generate chaotic random pattern"""
        eyes = []
        for _ in range(num_eyes):
            angle = random.random() * 2 * math.pi
            radius = random.random() * 200
            x = center_x + math.cos(angle) * radius
            y = center_y + math.sin(angle) * radius
            eyes.append({'x': int(x), 'y': int(y)})
        return eyes
    
    def generate_labyrinth(self, num_eyes, center_x=400, center_y=300):
        """Generate labyrinth/maze-like pattern"""
        eyes = []
        paths = 3
        
        for path in range(paths):
            path_length = num_eyes // paths
            start_angle = (2 * math.pi / paths) * path
            
            for i in range(path_length):
                # Create winding path
                progress = i / path_length
                radius = 50 + progress * 150
                angle = start_angle + progress * math.pi * 2
                wobble = math.sin(progress * math.pi * 8) * 20
                
                x = center_x + math.cos(angle) * (radius + wobble)
                y = center_y + math.sin(angle) * (radius + wobble)
                eyes.append({'x': int(x), 'y': int(y)})
        
        return eyes
    
    def generate_sequence(self, num_eyes, length, difficulty='medium'):
        """Generate a sequence based on difficulty"""
        sequence = []
        
        if difficulty == 'easy':
            # Simple patterns, some repetition
            for _ in range(length):
                sequence.append(random.randint(0, min(num_eyes - 1, 5)))
        elif difficulty == 'medium':
            # Full range, no immediate repeats
            last = -1
            for _ in range(length):
                choice = random.randint(0, num_eyes - 1)
                while choice == last:
                    choice = random.randint(0, num_eyes - 1)
                sequence.append(choice)
                last = choice
        elif difficulty == 'hard':
            # Complex patterns with symmetry
            half = length // 2
            first_half = [random.randint(0, num_eyes - 1) for _ in range(half)]
            # Mirror or reverse
            if random.random() > 0.5:
                second_half = first_half[::-1]  # Reverse
            else:
                second_half = first_half[:]  # Repeat
            sequence = first_half + second_half
        elif difficulty == 'expert':
            # Musical/mathematical patterns
            base = random.randint(2, 5)
            for i in range(length):
                sequence.append((i * base) % num_eyes)
        
        return sequence[:length]
    
    def create_level_pack(self, pack_name, theme, num_levels=10):
        """Create a themed level pack"""
        levels = []
        
        for i in range(num_levels):
            level_num = i + 1
            
            # Progressive difficulty
            if level_num <= 3:
                difficulty = 'easy'
                num_eyes = 8 + i * 2
                sequence_length = 4 + i
            elif level_num <= 6:
                difficulty = 'medium'
                num_eyes = 12 + i * 2
                sequence_length = 6 + i
            elif level_num <= 8:
                difficulty = 'hard'
                num_eyes = 15 + i * 2
                sequence_length = 8 + i
            else:
                difficulty = 'expert'
                num_eyes = 20 + i
                sequence_length = 10 + i
            
            # Select pattern based on theme
            if theme == 'mystical':
                pattern_types = ['mandala', 'pentagram', 'tree_of_life']
            elif theme == 'cosmic':
                pattern_types = ['spiral', 'constellation', 'fibonacci']
            elif theme == 'chaotic':
                pattern_types = ['chaos', 'labyrinth', 'spiral']
            else:
                pattern_types = list(self.patterns.keys())
            
            pattern_type = random.choice(pattern_types)
            
            # Generate level
            eyes = self.patterns[pattern_type](num_eyes)
            sequence = self.generate_sequence(num_eyes, sequence_length, difficulty)
            
            level = {
                'name': f'{pack_name} - Level {level_num}',
                'eyes': eyes,
                'sequence': sequence,
                'pattern_type': pattern_type,
                'difficulty': difficulty,
                'created': datetime.now().isoformat(),
                'id': int(datetime.now().timestamp() * 1000) + i
            }
            
            levels.append(level)
        
        return {
            'pack_name': pack_name,
            'theme': theme,
            'levels': levels,
            'created': datetime.now().isoformat(),
            'version': '1.0'
        }
    
    def export_pack(self, pack, filename):
        """Export level pack to JSON file"""
        with open(filename, 'w') as f:
            json.dump(pack, f, indent=2)
        print(f"Level pack exported to {filename}")
    
    def generate_all_packs(self):
        """Generate multiple themed packs"""
        packs = [
            ('Ancient Mysteries', 'mystical'),
            ('Cosmic Horror', 'cosmic'),
            ('Chaotic Visions', 'chaotic'),
            ('Sacred Geometry', 'mystical'),
            ('Stellar Patterns', 'cosmic'),
            ('Eldritch Designs', 'chaotic')
        ]
        
        for pack_name, theme in packs:
            pack = self.create_level_pack(pack_name, theme)
            filename = f"level_pack_{theme}_{pack_name.lower().replace(' ', '_')}.json"
            self.export_pack(pack, filename)

# Generate example packs
if __name__ == '__main__':
    generator = LevelPackGenerator()
    
    # Generate a single custom pack
    custom_pack = generator.create_level_pack("The Watcher's Trials", "mystical", 15)
    generator.export_pack(custom_pack, "watchers_trials_pack.json")
    
    # Generate all themed packs
    # generator.generate_all_packs()
    
    print("Level packs generated successfully!")
    print("\nTo use in the game:")
    print("1. Load the JSON file in the game's level editor")
    print("2. Or add to customLevels array in the game code")
    print("3. Share the JSON file with other players")