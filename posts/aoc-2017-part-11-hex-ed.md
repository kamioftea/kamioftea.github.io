---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Hex Ed
header: Hex Ed
date: 2017-12-18T05:00:00.000Z
updated: 2017-12-20T00:39:28.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 11](http://adventofcode.com/2017/day/11)

## Part 1

I need to find the shortest path to the origin on an infinite hex grid after following a sequence of directions. So I
set up some representations of a coordinate and a direction.

{% raw %}
```scala
case class Coordinate(x: Int, y: Int, z: Int) 
// defined class Coordinate

sealed trait Direction {
  def transform (coordinate: Coordinate): Coordinate
}
// defined trait Direction

case object N extends Direction {
  override def transform(c: Coordinate): Coordinate = 
    c.copy(x = c.x + 1, z = c.z - 1)
}
// defined object N

case object NE extends Direction {
  override def transform(c: Coordinate): Coordinate = 
    c.copy(x = c.x + 1, y = c.y - 1)
}
// defined object NE

case object SE extends Direction {
  override def transform(c: Coordinate): Coordinate = 
    c.copy(y = c.y - 1, z = c.z + 1)
}
// defined object SE

case object S extends Direction {
  override def transform(c: Coordinate): Coordinate = 
    c.copy(x = c.x - 1, z = c.z + 1)
}
// defined object S

case object SW extends Direction {
  override def transform(c: Coordinate): Coordinate = 
    c.copy(x = c.x - 1, y = c.y + 1)
}
// defined object SW

case object NW extends Direction {
  override def transform(c: Coordinate): Coordinate = 
    c.copy(y = c.y + 1, z = c.z - 1)
}
// defined object NW
```
{% endraw %}

Parsing the input is just mapping strings to the relevant case object:

{% raw %}
```scala
def parsePath(path: String): Seq[Direction] = 
  path.split(',').toSeq.collect {
    case "n" => N
    case "ne" => NE
    case "se" => SE
    case "s" => S
    case "sw" => SW
    case "nw" => NW
  }
// parsePath: (path: String)Seq[Direction]
```
{% endraw %}

Now I can actually write some logic. I must admit I didn't really have an
intuition for this problem, but I found a random blog post that helped, 
[Hexagon grids: coordinate systems and distance
calculations](http://keekerdc.com/2011/03/hexagon-grids-coordinate-systems-and-distance-calculations/)

{% raw %}
```scala
def distanceBetween(a: Coordinate, b: Coordinate): Int =
  Seq(Math.abs(a.x - b.x), Math.abs(a.y - b.y), Math.abs(a.z - b.z)).max
// distanceBetween: (a: Coordinate, b: Coordinate)Int

val origin = Coordinate(0, 0, 0)
// origin: Coordinate = Coordinate(0,0,0)

def homeDistance(path: Seq[Direction]): Int = {
  val destination = path.foldLeft(origin) {
    case (c, d) => d.transform(c)
  }
  
  distanceBetween(destination, origin)
}
// homeDistance: (path: Seq[Direction])Int

import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day11Part1Test extends FunSuite with Matchers {
  test("Can find distance from origin") {
    homeDistance(parsePath("ne,ne,ne")) shouldBe 3
    homeDistance(parsePath("ne,ne,sw,sw")) shouldBe 0
    homeDistance(parsePath("ne,ne,s,s")) shouldBe 2
    homeDistance(parsePath("ne,n,nw")) shouldBe 2
    homeDistance(parsePath("se,sw,se,sw,sw")) shouldBe 3
  }
}
// defined class Day11Part1Test

(new Day11Part1Test).execute()
// Day11Part1Test:
// - Can find distance from origin
``` 
{% endraw %}

I'm now able to find a solution for the puzzle input

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val puzzlePath = parsePath(
  Source.fromResource("day11input.txt").mkString("").trim
)
// puzzlePath: Seq[Direction] = ArrayBuffer(SE, S, S, SW, SW, SW, SW, SW, SW, NW, NW, NW, SE, N, NW, NW, NW, N, N, NW, N, N, N, NE, N, NE, NE, NW, SE, N, NE, NE, N, NE, NE, NE, SW, NE, NE, N, NE, SE, SE, NE, NE, S, NE, S, NE, NW, SE, NE, NE, NE, SE, SE, SE, SE, S, SE, SE, SE, SE, NW, SE, SE, SE, SE, SE, N, S, SE, SE, SE, SE, NE, SE, S, SE, SE, S, S, NE, SE, SE, S, SE, NW, NW, NW, NE, SW, S, NW, S, SW, S, NW, S, S, NW, S, S, SW, N, S, S, SW, SW, SW, SE, N, NE, NE, S, S, SE, SW, N, S, S, SW, SW, SW, SW, S, S, NW, S, S, S, SW, S, SE, SW, SW, S, SW, SW, N, SW, S, SW, NW, SW, SW, SW, SW, SW, NE, NE, SW, NW, NW, NE, SW, NW, NW, NW, SW, SW, SW, SW, NE, SW, SW, SW, SW, SW, NW, SW, SW, SW, NE, SW, SW, SW, S, SE, NW, NW, NW, NW, SW, N, NW, NW, SW, NW, SE, NW, SW, SW, NE, SW, NW, SW, NW, NW, NW, NW, ...

homeDistance(puzzlePath)
// res2: Int = 764
``` 
{% endraw %}
## Part 2 

This is much easier, given part one. I now need to find the maximum distance 
from the origin at any point along the path. This can be done just composing 
methods from the Scala collections library. 

{% raw %}
```scala
def maxDistance(path: Seq[Direction]): Int = {
  val breadcrumbs = path.scanLeft(origin) {
    case (c, d) => d.transform(c)
  }

  breadcrumbs.map(c => distanceBetween(c, origin)).max
}
// maxDistance: (path: Seq[Direction])Int
```
{% endraw %}

Which can be tested and then run.

{% raw %}
````scala

class Day11Part2Test extends FunSuite with Matchers {
  test("Can find max distance from origin") {
    maxDistance(parsePath("ne,ne,ne")) shouldBe 3
    maxDistance(parsePath("ne,ne,sw,sw")) shouldBe 2
    maxDistance(parsePath("ne,ne,sw,sw,se,se,se,nw,nw,nw")) shouldBe 3
    maxDistance(parsePath("ne,ne,s,s")) shouldBe 2
    maxDistance(parsePath("ne,n,nw")) shouldBe 2
    maxDistance(parsePath("se,sw,se,sw,sw")) shouldBe 3
  }
}

(new Day11Part2Test).execute()

maxDistance(puzzlePath)
```
{% endraw %}