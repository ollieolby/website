---
title: "Ski Lift Tilt"
description: "What started as a family ski trip quickly turned into a full-blown physics and machine learning mission to stop my excessive bulk from tipping the lift."
date: "2025-04-01"
author: "Ollie Olby"
tags: ["python", "physics", "reinforcement-learning"]
---
<p>Recently I went skiing with my mum and dad. We were very fortunate enough to be skiing at a very quiet time of year and as such we had no lift queues and were often the only three people on the lift. When you get on the lift there is a sign telling you to arrange yourself to avoid the ski lift having excessive tilt. This got me thinking, what is the arrangement of me, my mum and my dad that would provide the least tilt.</p><p>Luckily, I had a lot of downtime to think about this problem during the trip and decided to build a simple model to solve this. First, I needed to build the chair tilt dynamics.</p><p>To figure out the optimal seating arrangement, I modelled the tilt of the chairlift based on the distribution of weight (ignoring the weight of the lift and assuming it is symmetric). First, I needed to understand how weight causes the chair to tilt - in physics terms, this comes down to calculating moments around a central pivot point.</p><p>I wrote a Python class <code>LiftTilt</code> that calculates the net tilt on a chairlift, given a list of seat positions and weights. It simulates the moments acting around the midpoint of the chair to see whether the distribution of weight causes a tilt to the left, right, or remains balanced.</p>

```python
class LiftTilt():
    def __init__(self, seats, weights):
        self.seats = seats
        self.weights = weights

    def build_chair(self, output):
        chair = [None for i in range(self.seats)]
        for index, position in enumerate(output):
            chair[position] = self.weights[index]

        return chair

    def tilt(self, output):
        chair = self.build_chair(output)

        # Initialise the moments
        clockwise = 0
        anti_clockwise = 0

        # Determine mid point
        mid_point = self.seats / 2 - 0.5

        if self.seats % 2 == 0: #if even no. chairs
            for i, person in enumerate(chair):
                if i < mid_point:
                    if person is not None:
                        anti_clockwise += (mid_point - i + 0.5) * person
                elif i > mid_point:
                    if person is not None:
                        clockwise += (i - mid_point + 0.5) * person

        else: # odd no. chairs
            for i, person in enumerate(chair):
                if i < mid_point:
                    if person is not None:
                        anti_clockwise += (mid_point - i) * person
                elif i > mid_point:
                    if person is not None:
                        clockwise += (i - mid_point) * person

        tilt = clockwise - anti_clockwise

        return tilt
```

<p>To find the best seating arrangement, I used a brute-force approach - trying every possible combination of seat assignments and calculating the tilt for each. Since there are only 3 people and a maximum of 10 seats, this was computationally cheap (only 720 combinations).</p><p>The total number of arrangements can be found easily by going back to A level maths through the simple permutation equation. P(n,r) = n!/(n-r)! </p><p>For this example I assumed my mum had a mass of 60kg, my dad, 80kg and myself, 100kg. (I have to tell you that these are not accurate)</p>

```python
import itertools
from lift_tilt import LiftTilt

def seat_arrangements(people, n):
    # Get all combinations of x people seated in n available seats
    return list(itertools.permutations(range(n), len(people)))

lift_sizes = [10]

weights = [60, 80, 100]

results = []

for seats in lift_sizes:
	arrangements = seat_arrangements(weights, seats)

	lift_tilt = LiftTilt(seats, weights)

	for i, position in enumerate(arrangements):
	    mapping = {person: seat for person, seat in zip(weights, position)}

	    output = []
	    for i in mapping:
	    	output.append(mapping[i])

	    tilt = lift_tilt.tilt(output)

	    results.append([tilt, mapping, seats])

results = sorted(results, key=lambda x: abs(x[0]))

print(results)
```

<p>We can see that there are a total of 10 different ways to arrange the three of us on a 10-person chairlift that result in zero tilt. That's great news - it means we can write a quick brute-force program to identify all the optimal configurations when the number of seats is small.</p><p>But what happens if we're dealing with a much larger lift? Say, one with 1000 seats?<br/>Trying every possible arrangement becomes completely infeasible - there are more than 108108 permutations for just three people! The brute-force approach breaks down fast.</p><p>So I turned to reinforcement learning - a machine learning technique that can help the algorithm learn optimal solutions through trial and error, without needing to explore every possibility.</p><p>The core idea is to train a model (called a policy) to decide where each person should sit, in a way that minimizes the chair's tilt.</p><p>The policy is a small neural network that takes as input a representation of the people and outputs a probability distribution over the possible seat choices. It's trained to learn which seating positions are better over time.</p><p>The goal is to minimise tilt, so we define a reward function that gives a higher score (closer to zero) for arrangements with smaller tilt values. Rather than exhaustively checking every arrangement (which is computationally impossible), reinforcement learning intelligently explores the space of seatings.</p>

```python
import torch
import torch.nn as nn
import torch.optim as optim
import itertools
import random
from lift_tilt import LiftTilt

# Settings
lift_size = 1000
weights = [60, 80, 100]
n_people = len(weights)
n_seats = lift_size
n_episodes = 1000

# Environment (simplified reward = -abs(tilt))
class LiftEnv:
    def __init__(self, lift_size, weights):
        self.lift_size = lift_size
        self.weights = weights
        self.n_people = len(weights)
        self.lift_tilt = LiftTilt(lift_size, weights)

    def step(self, positions):
        output = [positions[person] for person in self.weights]
        tilt = self.lift_tilt.tilt(output)
        reward = -abs(tilt)  # reward is higher for less tilt
        return reward, tilt

# Policy Model (MLP)
class Policy(nn.Module):
    def __init__(self, n_people, n_seats):
        super().__init__()
        self.linear = nn.Linear(n_people, n_seats)

    def forward(self, x):
        logits = self.linear(x)
        return torch.softmax(logits, dim=-1)

# Initialize
env = LiftEnv(lift_size, weights)
policy = Policy(n_people, n_seats)
optimizer = optim.Adam(policy.parameters(), lr=0.01)

# One-hot encoding input for simplicity
input_tensor = torch.eye(n_people)

best_tilt = float('inf')
best_mapping = None

for episode in range(n_episodes):
    probs = policy(input_tensor)  # Shape: [n_people, n_seats]

    m = torch.distributions.Categorical(probs)
    actions = m.sample()  # Random seat index for each person

    # Ensure all seats are unique (no duplicates)
    if len(set(actions.tolist())) < n_people:
        continue

    mapping = {person: int(seat) for person, seat in zip(weights, actions.tolist())}
    reward, tilt = env.step(mapping)

    loss = -torch.tensor(reward, dtype=torch.float32, requires_grad=True)

    optimizer.zero_grad()
    loss.backward()
    optimizer.step()

    if abs(tilt) < best_tilt:
        best_tilt = abs(tilt)
        best_mapping = mapping

    if episode % 100 == 0:
        print(f"Episode {episode} | Tilt: {tilt:.2f} | Best Tilt: {best_tilt:.2f} | Mapping: {mapping}")

print("\nBest Seat Mapping:", best_mapping)
print("Best Tilt:", best_tilt)
```

<p>This will find an optimal solution (tilt=0) for 1000 chairs within ~8500 episodes which is much faster than the 10⁸ different arrangements that are needed to search all the arrangements here.</p><p>To add an additional complication to this problem, my Dad is a snowboarder and he will always sit on the right hand side of me and my Mum (because snowboarders are useless when it comes to getting off lifts and he rides regular). So in order to find a correct solution only the solutions where the 80kg mass is furthest right of the other two masses are considered.</p><p>This meant for the 10 seat option there were only 2 solutions to the problem. Me in seat 3, Mum in seat 6 and Dad in seat 8, or Me in seat 1, Dad in seat 9 and Mum in seat 8.</p><p>This also meant that the smallest number of chairs where there is a solution is a 6 seat lift: Me in seat 1, Mum in seat 4 and Dad in seat 6.</p>

![](https://images.squarespace-cdn.com/content/v1/67d00232192a697f5e3968be/3adb0e00-e94c-494b-bc10-5227743673a4/Screenshot+2025-04-01+at+23.10.25.png)

![](https://images.squarespace-cdn.com/content/v1/67d00232192a697f5e3968be/19d76bb8-0492-42fe-b0f3-0e646ce5258a/Screenshot+2025-04-01+at+23.10.06.png)

![](https://images.squarespace-cdn.com/content/v1/67d00232192a697f5e3968be/455dec94-8278-491f-8a5b-f0881f3b490c/Screenshot+2025-04-01+at+23.09.51.png)

<p>This was one of those problems that didn't <em>need</em> to be solved... but was a good excuse to explore policy networks.<br/>It's a reminder that there are excellent coding problems hiding in plain sight everywhere and its important in this day and age to be bored so that your brain can create these problems.</p>
