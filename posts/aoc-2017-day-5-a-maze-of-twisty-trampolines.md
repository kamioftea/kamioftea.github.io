---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: A Maze of Twisty Trampolines, All Alike
header: A Maze of Twisty Trampolines, All Alike
date: 2017-12-12T05:00:00.000Z
updated: 2017-12-14T21:44:51.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 5](http://adventofcode.com/2017/day/5)

## Part 1

I have a sequence of integers, to be interpreted as jump instructions. Starting at the first item, the task is to use
the current value of my position as an offset to get to a new position. Incrementing the value in the current position
before jumping. I need to return the number of jumps performed before a jump would take the current position out of the
range of the sequence. 

It seemed best just to simulate the steps. It is useful to note that the increment ensures that this will always
(eventually) terminate for a finite sequence.

{% raw %}
```scala
def countMoves(offsets: Seq[Int]): Int = {
  def iter(os: Vector[Int], count: Int = 0, position: Int = 0): Int =
    if (!os.isDefinedAt(position)) count
    else iter(
      os.updated(position, os(position) + 1),
      count + 1,
      position = position + os(position)
    )
    
  iter(offsets.toVector)
}
// countMoves: (offsets: Seq[Int])Int
``` 
{% endraw %}

There was only one example provided, but it is fairly simple to synthesise a few extra tests from very basic examples

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day5Part1Test extends FunSuite with Matchers {
  test("can count jumps") {
    countMoves(Seq(0,3,0,1,-3)) shouldBe 5
    countMoves(Seq(1)) shouldBe 1
    countMoves(Seq(-1)) shouldBe 1
    countMoves(Seq(0)) shouldBe 2
  }
}
// defined class Day5Part1Test

(new Day5Part1Test).execute()
// Day5Part1Test:
// - can count jumps
```
{% endraw %}

The actual input was much longer, and presented as one integer per line. The simulation was still quick enough not to
notice a delay.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

def input = Source.fromResource("day5input.txt").getLines().map(_.toInt).toSeq
// input: Seq[Int]

countMoves(input)
// res1: Int = 376976
```
{% endraw %}

## Part 2

This was only a slight modification, now the algorithm converges on 2½. Admittedly, it'll never reach this value,
instead toggling between 2 and 3. The algorithm is still guaranteed to terminate as in the worst-case the sequence will
eventually converge on 2s and 3s, which will shift the pointer off the end.

{% raw %}
```scala
def countMovesWithConvergence(offsets: Seq[Int]): Int = {
  def iter(os: Vector[Int], count: Int = 0, position: Int = 0): Int =
    if (!os.isDefinedAt(position)) count
    else {
      val offset = os(position)
      iter(
        os.updated(position, if (offset < 3) offset + 1 else offset - 1),
        count + 1,
        position = position + offset
      )
  }
  
  iter(offsets.toVector)
}
// countMovesWithConvergence: (offsets: Seq[Int])Int
```
{% endraw %}

Most of the tests can be reused, and I added one extra as most of the existing
tests produced the same output despite the change.

{% raw %}
```scala
class Day5Part2Test extends FunSuite with Matchers {
  test("can count jumps with convergence") {
    countMovesWithConvergence(Seq(0,3,0,1,-3)) shouldBe 10
    countMovesWithConvergence(Seq(1)) shouldBe 1
    countMovesWithConvergence(Seq(-1)) shouldBe 1
    countMovesWithConvergence(Seq(0)) shouldBe 2
    countMovesWithConvergence(Seq(3, 1 , 2, -3)) shouldBe 4
  }
}
// defined class Day5Part2Test

(new Day5Part2Test).execute()
// Day5Part2Test:
// - can count jumps with convergence
```
{% endraw %}

The change let to increase in jumps required by two orders of magnitude. There was about a 4 second delay when running
it the first time after compilation. Given a couple of runs for optimisation, it was running both parts in less than 1.5
seconds.

{% raw %}
```scala
 countMovesWithConvergence(input)
// res3: Int = 29227751
```
{% endraw %}