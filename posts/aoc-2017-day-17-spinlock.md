---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Spinlock
header: Spinlock
date: 2017-12-24T05:00:00.000Z
updated: 2017-12-24T05:00:00.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
# Spinlock

A solution for [Advent of Code 2017 - Day 17](http://adventofcode.com/2017/day/17)

## Part 1

For part one it was mostly just building a vector one element at at time. 

{% raw %}
```scala
def spin(iterations:Int,
         step: Int,
         pos: Int = 0,
         buffer: Vector[Int] = Vector(0),
         current: Int = 0): (Int, Vector[Int]) = (
  if(current == iterations) (pos, buffer)
  else {
    val splitPos = ((pos + step) % buffer.length) + 1
    val (pre, post) = buffer.splitAt(splitPos)
    spin(iterations,step,splitPos, pre ++ Vector(current + 1) ++ post, current + 1)
  }
)
// spin: (iterations: Int, step: Int, pos: Int, buffer: Vector[Int], current: Int)(Int, Vector[Int])

def getSubsequentValue(target: Int, step:Int): Int = {
  val (pos, buffer) = spin(target, step)
  buffer((pos + 1) % buffer.length)
}
// getSubsequentValue: (target: Int, step: Int)Int
```
{% endraw %}

The walk-through did give a fairly large number of test cases.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day17Part1Test extends FunSuite with Matchers {

  test("can spin buffer") {
    spin(0, 3) shouldBe (0, Vector(0))
    spin(1, 3) shouldBe (1, Vector(0,1))
    spin(2, 3) shouldBe (1, Vector(0,2,1))
    spin(3, 3) shouldBe (2, Vector(0,2,3,1))
    spin(4, 3) shouldBe (2, Vector(0,2,4,3,1))
    spin(5, 3) shouldBe (1, Vector(0,5,2,4,3,1))
    spin(6, 3) shouldBe (5, Vector(0,5,2,4,3,6,1))
    spin(7, 3) shouldBe (2, Vector(0,5,7,2,4,3,6,1))
    spin(8, 3) shouldBe (6, Vector(0,5,7,2,4,3,8,6,1))
    spin(9, 3) shouldBe (1, Vector(0,9,5,7,2,4,3,8,6,1))
  }
  
  test("can determine following value") {
    getSubsequentValue(0, 3) shouldBe 0
    getSubsequentValue(1, 3) shouldBe 0
    getSubsequentValue(2, 3) shouldBe 1
    getSubsequentValue(3, 3) shouldBe 1
    getSubsequentValue(4, 3) shouldBe 3
    getSubsequentValue(5, 3) shouldBe 2
    getSubsequentValue(6, 3) shouldBe 1
    getSubsequentValue(7, 3) shouldBe 2
    getSubsequentValue(8, 3) shouldBe 6
    getSubsequentValue(9, 3) shouldBe 5

    getSubsequentValue(2017, 3) shouldBe 638
  }
}
// defined class Day17Part1Test

(new Day17Part1Test).execute()
// Day17Part1Test:
// - can spin buffer
// - can determine following value
```
{% endraw %}

This can then be run with the required step count for the puzzle.

{% raw %}
```scala
getSubsequentValue(2017, 337)
// res1: Int = 600
```
{% endraw %}

## Part 2

For part two it is not really feasible to build the full 50 million entry Vector. However as I'm just tracking the
number after 0, all I need to keep track of is
* The current position of the 0 value, increments by one if a number would be inserted at or before the current 0 value,
* The current value after 0, changes if the insertion position is exactly one more than the current position.
* The current insertion position.

{% raw %}
```scala
def trackZero(iterations: Int,
              step: Int,
              currPos: Int = 0,
              zeroPos: Int = 0,
              valueAfterZero: Int = 0,
              current: Int = 0): Int = (
  if(current == iterations) valueAfterZero
  else {
    val newPos = 
      if(current == 0) 1 
      else ((currPos + step) % (current + 1)) + 1
    
    trackZero(
      iterations,
      step,
      newPos,
      if(newPos <= zeroPos) zeroPos + 1 else zeroPos,
      if(newPos == zeroPos + 1) current + 1 else valueAfterZero,
      current + 1
    )
  }
)
// trackZero: (iterations: Int, step: Int, currPos: Int, zeroPos: Int, valueAfterZero: Int, current: Int)Int
```
{% endraw %}

I can reuse the previous test cases and also the output from the first part
can be used.

{% raw %}
```scala
class Day17Part2Test extends FunSuite with Matchers {

  test("can track number after zero")
  {
    trackZero(0, 3) shouldBe 0
    trackZero(1, 3) shouldBe 1
    trackZero(2, 3) shouldBe 2
    trackZero(3, 3) shouldBe 2
    trackZero(4, 3) shouldBe 2
    trackZero(5, 3) shouldBe 5
    trackZero(6, 3) shouldBe 5
    trackZero(7, 3) shouldBe 5
    trackZero(8, 3) shouldBe 5
    trackZero(9, 3) shouldBe 9

    val (_, buffer) = spin(2017, 3)

    trackZero(2017, 3) shouldBe buffer(buffer.indexOf(0) + 1)
  }
}
// defined class Day17Part2Test

(new Day17Part2Test).execute()
// Day17Part2Test:
// - can track number after zero
```
{% endraw %}
And now I'm able to complete the puzzle

{% raw %}
```scala
trackZero(50000000, 337)
// res3: Int = 31220910
```
{% endraw %}