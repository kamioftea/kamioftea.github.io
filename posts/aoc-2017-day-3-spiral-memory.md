---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Spiral Memory
header: Spiral Memory
date: 2017-12-10T05:00:00.000Z
updated: 2017-12-13T22:56:06.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 3](http://adventofcode.com/2017/day/3)

## Part 1 

For this I was required to find the shortest [Manhattan Distance](https://en.wikipedia.org/wiki/Taxicab_geometry) to the
origin from the 347991th square to be filled when allocating sequentially in a spiral pattern.

Given the intuition that the grid fills in rings with edges length 2n - 1, and a shortest path can be achieved by
travelling to the center of the current ring,then walking to the center through the inner rings the distance can be
determined using a simple formula.

{% raw %}
```scala
def calcDistance(pos: Int): Int = {
  // prevent / 0 errors
  if(pos == 1) return 0

  val ring: Int = Math.ceil(Math.sqrt(pos.toFloat)).toInt / 2 
  val sidePos: Int = ((Math.pow(ring * 2 + 1, 2) - pos).toInt % (ring * 2)) - ring
  
  ring + Math.abs(sidePos)
}
// calcDistance: (pos: Int)Int
```   
{% endraw %}

I have a feeling that for part two, my plan to use a formula rather than just building the grid may leave me having to
implement the grid anyway for the variant on the theme. First I need to check my maths with the provided examples; there
is a lot of potential to get rounding and out-by-one errors here.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day3Part1Test extends FunSuite with Matchers {
  test("Can calculate distance"){
    calcDistance(1) shouldBe 0
    calcDistance(12) shouldBe 3
    calcDistance(23) shouldBe 2
    calcDistance(1024) shouldBe 31
  }
}
// defined class Day3Part1Test

(new Day3Part1Test).execute()
// Day3Part1Test:
// - Can calculate distance
``` 
{% endraw %}

Given those work I can plug in the puzzle location

{% raw %}
```scala
calcDistance(347991)
// res1: Int = 480
```
{% endraw %}

## Part 2

For this the grid is filled by summing the adjacent grid squares. I couldn't intuit way to calculate it based on the
geometry as above, so just decided to build the grid. 

Given that the number will more than double as it rounds each corner of the spiral, 347991 log<sub>16</sub> rings (6)
should be enough. For ease of calculation I'm summing all adjacent squares, so I'll need an extra ring (7) to prevent
overflow there. This means the puzzle should fit in a 13 x 13 grid (2n - 1), with the origin at (6,6).

To keep track of how to progress around the spiral path, I'll generate a sequence of movements for each ring when the
previous ring is completed. 

The steps for each cell are:
1. Calculate the current value by summing adjacent cells, minimum 1 for the seed cell.
2. Check if the target has been exceeded?
* Yes: Calculation complete: return the value
* No : Iterate with the calculated value in the current cell 
3. Iterate to the next position, calculating the sequence of moves for the next ring if the previous one has been
exhausted.

{% raw %}
```scala
def calcSweepValue(target: Int): Int = {
  val adjacentCells = Seq(
    (-1, -1), ( 0, -1), ( 1, -1),
    (-1,  0),           ( 1,  0),
    (-1,  1), ( 0,  1), ( 1,  1)
  )
  
  def buildDirections(ring: Int): Seq[(Int, Int)] =
    Seq(
      Seq.fill(2 * ring - 1)((0, -1)),
      Seq.fill(2 * ring)((-1, 0)),
      Seq.fill(2 * ring)((0, 1)),
      Seq.fill(2 * ring)((1, 0))
    ).flatten
 
  
  def iter(matrix: Vector[Vector[Int]], 
           pos: (Int, Int), 
           directions: Seq[(Int,Int)],
           ring: Int): Int = {
    val (x, y) = pos
    val currentValue: Int = 
      Math.max(
        adjacentCells.foldLeft(0){
            case (acc, (px, py)) => acc + matrix(x + px)(y + py)
        },
        1
      )
    
    directions match {
      case _ if currentValue > target => 
        currentValue
      case Nil => 
        iter(
          matrix.updated(x, matrix(x).updated(y, currentValue)),
          (x + 1, y),
          buildDirections(ring),
          ring + 1
        )
      case (dx, dy) +: ds =>
        iter(
          matrix.updated(x, matrix(x).updated(y, currentValue)),
          (x + dx, y + dy),
          ds,
          ring
        )
    }
  }
  
  iter(
    Vector.fill(13, 13)(0),
    (6, 6),
    Seq(),
    1
  )
}
// calcSweepValue: (target: Int)Int
```
{% endraw %}

I built some tests from the diagram of the grid start on the puzzle page. 

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day3Part2Test extends FunSuite with Matchers {
  test("Can calculate next inserted value after target"){
    calcSweepValue(1) shouldBe 2
    calcSweepValue(3) shouldBe 4
    calcSweepValue(24) shouldBe 25
    calcSweepValue(25) shouldBe 26
    calcSweepValue(26) shouldBe 54
    calcSweepValue(800) shouldBe 806
  }
}
// defined class Day3Part2Test

(new Day3Part2Test).execute()
// Day3Part2Test:
// - Can calculate next inserted value after target
``` 
{% endraw %}

With those passing, I can now complete the puzzle.

{% raw %}
```scala
  calcSweepValue(347991)
// res3: Int = 349975
```
{% endraw %}