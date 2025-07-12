

# config.py
MAX_NUMBER = 100
MIN_NUMBER = 1
MAX_ATTEMPTS = 10


# themes.py
EMOJIS = {
    "welcome": "🎲",
    "low": "🔻",
    "high": "🔺",
    "win": "🎉",
    "error": "❌",
    "range_warning": "⚠️"
}

def themed_message(key, message):
    return f"{EMOJIS.get(key, '')} {message}"

# utils.py
def get_valid_guess(min_value, max_value):
    while True:
        try:
            guess = int(input(f"Enter your guess ({min_value}–{max_value}): "))
            if guess < min_value or guess > max_value:
                print(f"⚠️ Please guess within {min_value}–{max_value}.")
            else:
                return guess
        except ValueError:
            print("❌ Invalid input. Enter a number.")

# game_logic.py
import random
from config import MIN_NUMBER, MAX_NUMBER
from utils import get_valid_guess
from themes import themed_message

def play_game():
    print(themed_message("welcome", "Welcome to the Modular Number Guessing Game!"))
    number_to_guess = random.randint(MIN_NUMBER, MAX_NUMBER)
    attempts = 0

    while True:
        guess = get_valid_guess(MIN_NUMBER, MAX_NUMBER)
        attempts += 1

        if guess < number_to_guess:
            print(themed_message("low", "Too low! Try again."))
        elif guess > number_to_guess:
            print(themed_message("high", "Too high! Try again."))
        else:
            print(themed_message("win", f"Correct! You guessed it in {attempts} attempts."))
            return attempts

# scoreboard.py
scores = []

def record_score(player_name, attempts):
    scores.append((player_name, attempts))

def show_scores():
    print("\n🏆 Scoreboard:")
    for name, score in sorted(scores, key=lambda x: x[1]):
        print(f"{name}: {score} attempts")

# main.py
from game_logic import play_game
from scoreboard import record_score, show_scores

def main():
    print("🎯 Starting the Game...")
    player = input("Enter your name: ")
    attempts = play_game()
    record_score(player, attempts)

    show_scores()
    print("🙌 Thanks for playing!")

if __name__ == "__main__":
    main()

