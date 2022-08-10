---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: A Series of Tubes
header: A Series of Tubes
date: 2017-12-26T05:00:00.000Z
updated: 2018-04-04T22:22:23.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 19](http://adventofcode.com/2017/day/19)

## Part 1

Since all I needed was a grid of characters that I could access by index, then just parsing the input into a
`Vector[String]` is good enough.

To find the answer, I need to find where the path starts and then follow it until the next step is not valid. For `-`
and `|` I can just step forward, and disregarding which one I have seen means that the points where a line crosses are
handled correctly. Letters are pretty much the same, but need to be recorded, finally only `+` can change direction, so
on finding one we need to check all three possible next steps for a valid character.


{% raw %}
```scala
def findStart(grid: Vector[String]): Int = {
  grid(0).indexOf('|')
}
// findStart: (grid: Vector[String])Int

def findPath(grid: Vector[String]): (String, Int) = {
  def canTravel(x: Int, y: Int): Boolean =
    grid.isDefinedAt(y) &&
      grid(y).isDefinedAt(x) &&
      grid(y)(x) != ' '

  def init(x: Int, y: Int, path: String, dx: Int, dy: Int, count: Int): (String, Int) =
    if (!canTravel(x, y))
      (path, count)
    else grid(y)(x) match {
      case '|' | '-' => init(x + dx, y + dy, path, dx, dy, count + 1)
      case '+' =>
        if (canTravel(x + dx, y + dy)) init(x + dx, y + dy, path, dx, dy, count + 1)
        else if (canTravel(x + dy, y + dx)) init(x + dy, y + dx, path, dy, dx, count + 1)
        else if (canTravel(x - dy, y - dx)) init(x - dy, y - dx, path, -dy, -dx, count + 1)
        else (path, count)
      case c => init(x + dx, y + dy, path + c, dx, dy, count + 1)
    }

  init(findStart(grid), 0, "", 0, 1, 0)
}
// findPath: (grid: Vector[String])(String, Int)
```
{% endraw %}

There is a sample mini-grid provided which can be used to make test cases.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day19Part1Test extends FunSuite with Matchers {

  private val testGrid =
    """#     |
       #     |  +--+
       #     A  |  C
       # F---|----E|--+
       #     |  |  |  D
       #     +B-+  +--+""".stripMargin('#').lines.toVector

  test("testFindStart") {
    findStart(testGrid) shouldBe 5
  }

  test("testFindPath") {
    findPath(testGrid) shouldBe ("ABCDEF", 38)
  }

}
// defined class Day19Part1Test

(new Day19Part1Test).execute()
// Day19Part1Test:
// - testFindStart
// - testFindPath
```
{% endraw %}

This can then be run to get the answer.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val grid = Source.fromResource("day19input.txt").getLines().toVector
// grid: Vector[String] = Vector("                                                                             |                                                                                                                           ", "             +-------+       +-------+   +-+                                 | +-------------------------------------------+                   +---------------+     +-+ +---------------------------+   ", "             |       |       |       |   | |                                 | |                                           |                   |               |     | | |                           |   ", " +---------------------------+       |   | +---------------------------------|-|---------+   +---------------------------------------------------------...

findPath(grid)
// res1: (String, Int) = (XYFDJNRCQA,17450)
```
{% endraw %}

## Part 2

My code for part one also outputs the path length, which answers this part. I wasn't quite so prescient to output that
for part 1 just because, but it was such a simple change that I just updated my part one solution to output the value,
and the test case to check it. 

Puzzle completed.
