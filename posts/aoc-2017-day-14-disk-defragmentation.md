---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Disk Defragmentation
header: Disk Defragmentation
date: 2017-12-21T05:00:00.000Z
updated: 2017-12-21T05:00:00.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 14](http://adventofcode.com/2017/day/14)

## Part 1

For the first part we need to reuse the implementation for [day
10](https://blog.goblinoid.co.uk/aoc-2017-day-10-knot-hash/)

{% raw %}
```scala
import Day10._
// import Day10._
```
{% endraw %}

With that available I can now use it to run the repeated hash on the input, convert it to a binary representation and
count the bits that have been set.

{% raw %}
```scala
def countBits(hexString: String): Int = (
  hexString
    .grouped(4).map(s => Integer.parseInt(s, 16).toBinaryString)
    .mkString("")
    .count(_ == '1')
)
// countBits: (hexString: String)Int

def countUsed(key: String): Int = (
  (0 to 127)
    .map(i => Day10.knotHash(s"$key-$i"))
    .map(countBits)
    .sum
)
// countUsed: (key: String)Int
```
{% endraw %}

Check that it works:

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day14Part1Test extends FunSuite with Matchers {

  test("testCountBits") {
    countBits("0") shouldBe 0
    countBits("1") shouldBe 1
    countBits("e") shouldBe 3
    countBits("f") shouldBe 4
    countBits("ff") shouldBe 8
    countBits("1248") shouldBe 4
    countBits("137f") shouldBe 10
    countBits("f0000000000000000000000000000001") shouldBe 5
  }

  test("testCountUsed") {
    countUsed("flqrgnkx") shouldBe 8108
  }
}
// defined class Day14Part1Test

(new Day14Part1Test).execute()
// Day14Part1Test:
// - testCountBits
// - testCountUsed
```
{% endraw %}

Run for the puzzle input:

{% raw %}
```scala
countUsed("xlqgujun")
// res1: Int = 8204
```
{% endraw %}

## Part 2

Today's theme seems to be code reuse. This one is slightly less specific but the challenge allows me to reuse the
clustering from [day 12](https://blog.goblinoid.co.uk/aoc-2017-day-12-digital-plumber/) if I can munge the input into
the same input. The only hiccup is that for day 12 it is assumed that the nodes are sequentially numbered, and have at
least one connection. For this puzzle we want to ignore the 0 bits. I added a small change to the algorithm in so that a
number of nodes can be excluded from the algorithm using a map, and build a mask of all the 0 bits as I transform the
data into the expected `Vector[Set[Int]]` format.

{% raw %}
```scala
import scala.collection.BitSet
// import scala.collection.BitSet

def drawBits(hexString: String): String = (
  hexString
    .grouped(4).map(s => Integer.parseInt(s, 16).toBinaryString.formatted("%16s").replaceAll(" ", "0"))
    .mkString("")
)
// drawBits: (hexString: String)String

def clusterWith(root: Int, edges: Vector[Set[Int]]): BitSet = {
  def iter(linkedEdges: Seq[Int], matches: BitSet): BitSet = linkedEdges match {
    case Nil => matches
    case e +: es if matches.contains(e) => iter(es, matches)
    case e +: es => iter(es ++ edges(e), matches + e)
  }
  
  iter(edges(root).toSeq, BitSet(root))
}
// clusterWith: (root: Int, edges: Vector[Set[Int]])scala.collection.BitSet

def countClusters(edges: Vector[Set[Int]], mask: Vector[Boolean]): Int = {
  def iter(toProcess: Seq[Int], matches: BitSet, count: Int): Int = toProcess match {
    case Nil => count
    case e +: es if matches.contains(e) => iter(es, matches, count)
    case e +: es => iter(es, matches ++ clusterWith(e, edges), count + 1)
  }
  
  iter(edges.indices.filter(e => mask(e)), BitSet.empty, 0)
}
// countClusters: (edges: Vector[Set[Int]], mask: Vector[Boolean])Int

def countRegions(key: String): Int = {
  val matrix = Vector.iterate(0, 128)(_ + 1).map(i => drawBits(Day10.knotHash(s"$key-$i")))
  val edgesWithMask: Vector[(Set[Int], Boolean)] = (for(x <- 0 to 127; y <- 0 to 127) yield {
    (Set((-1, 0), (0, -1), (1, 0), (0,1)).collect {
      case (dx, dy) if matrix.isDefinedAt(x + dx) && matrix(x + dx).isDefinedAt(y + dy) && matrix(x + dx)(y + dy) == matrix(x)(y)
      => y + dy + 128 * (x + dx)
    }, matrix(x)(y) == '1')
  }).toVector

  val edges = edgesWithMask.map(_._1)
  val mask = edgesWithMask.map(_._2)

  countClusters(edges, mask)
}
// countRegions: (key: String)Int
```
{% endraw %}

Test that we can generate correct output for the example given

{% raw %}
```scala
class Day14Part2Test extends FunSuite with Matchers {
  test("testCountRegions") {
    countRegions("flqrgnkx") shouldBe 1242
  }
}
// defined class Day14Part2Test

(new Day14Part2Test).execute()
// Day14Part2Test:
// - testCountRegions
```
{% endraw %}

With that working I can input the puzzle input and submit a solution

{% raw %}
```scala
countRegions("xlqgujun")
// res3: Int = 1089
```
{% endraw %}
