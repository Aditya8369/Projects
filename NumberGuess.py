import random

def number_guessing_game():
    print("🎲 Welcome to the Number Guessing Game!")
    number_to_guess = random.randint(1, 100)
    attempts = 0

    while True:
        try:
            guess = int(input("Enter your guess (1–100): "))
            attempts += 1

            if guess < 1 or guess > 100:
                print("⚠️ Please guess within the range 1–100.")
            elif guess < number_to_guess:
                print("Too low! Try again 🔻")
            elif guess > number_to_guess:
                print("Too high! Try again 🔺")
            else:
                print(f"🎉 Congratulations! You guessed it in {attempts} attempts.")
                break
        except ValueError:
            print("❌ That's not a valid number. Try again.")

# Run the game
number_guessing_game()
