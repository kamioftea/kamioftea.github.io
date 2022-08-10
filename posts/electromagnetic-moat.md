---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Electromagnetic Moat
header: Electromagnetic Moat
date: 2017-12-31T00:00:00.000Z
updated: 2018-05-26T12:08:23.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 24](http://adventofcode.com/2017/day/24)

## Part 1

For this task I have to build a bridge by combining pairs of integers like dominoes. Firstly I need the data in a useful
representation. The components I represent as a case class, and include a unique id so that if there are any duplicated
components, they still count as different when checking if they have been used before. I then build a map that can look
up the components by either connector.

{% raw %}
```scala
case class Component(id: Int, a: Int, b: Int)
// defined class Component

def parseInput(lines: Seq[String]): Map[Int, Set[Component]] = {
  lines
  .map(_.split("/").toSeq)
  .zipWithIndex.collect {
    case ((a +: b +: _), id) => Component(id, a.toInt, b.toInt)
  }
  .foldLeft(Map.empty[Int, Set[Component]]) {
    case (acc, comp) =>
      acc
      .updated(comp.a, acc.getOrElse(comp.a, Set.empty) + comp)
      .updated(comp.b, acc.getOrElse(comp.b, Set.empty) + comp)
  }
}
// parseInput: (lines: Seq[String])Map[Int,Set[Component]]
```
{% endraw %}

To get the strongest bridge I'm just going to create all the possible bridges and find the maximum strength. This is
wildly inefficient, but I can optimise it later if it turns out not to run quickly enough. 

Building the bridges can be done recursively. I only need to know what is in the bridge so far and how many connectors
the current end piece has. From that, my pool of components is already indexed by connector count, so I can grab the
viable pieces and iterate for each of the new, longer bridges.

{% raw %}
```scala
def buildBridges(components: Map[Int, Set[Component]]): Seq[Seq[Component]] = {
  def iter(bridge: Seq[Component], openPort: Int): Seq[Seq[Component]] = {
    bridge +:
      components.getOrElse(openPort, Seq.empty)
      .filter(!bridge.contains(_))
      .flatMap(c => iter(c +: bridge, if (c.a == openPort) c.b else c.a)).toSeq
  }

  iter(Seq.empty, 0)
}
// buildBridges: (components: Map[Int,Set[Component]])Seq[Seq[Component]]

def scoreBridge(bridge: Seq[Component]): Int =
  bridge.map(b => b.a + b.b).sum
// scoreBridge: (bridge: Seq[Component])Int

def strongestBridge(components: Map[Int, Set[Component]]): Int = {
  buildBridges(components)
  .map(scoreBridge)
  .max
  }
// strongestBridge: (components: Map[Int,Set[Component]])Int
```
{% endraw %}

I can now parse the sample data, check that it is represented correctly, and that the output of the various stages
matches the examples from the puzzle.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day24Part1Test extends FunSuite with Matchers {
  test("can parse input") {
    parseInput(
      """0/2
        |2/2
        |2/3
        |3/4
        |3/5
        |0/1
        |10/1
        |9/10""".stripMargin.lines.toSeq
    ) shouldBe Map(
      0 -> Set(Component(0, 0, 2), Component(5, 0, 1)),
      1 -> Set(Component(6, 10, 1), Component(5, 0, 1)),
      2 -> Set(Component(0, 0, 2), Component(1, 2, 2), Component(2,2,3)),
      3 -> Set(Component(2, 2, 3), Component(3,3,4),Component(4,3,5)),
      4 -> Set(Component(3,3,4)),
      5 -> Set(Component(4,3,5)),
      9 -> Set(Component(7, 9,10)),
      10 -> Set(Component(7, 9,10), Component(6, 10, 1))
    )
  }
  
  test("can build bridges") {
    val bridges = buildBridges(Map(
      0 -> Set(Component(0, 0, 2), Component(5, 0, 1)),
      1 -> Set(Component(6, 10, 1), Component(5, 0, 1)),
      2 -> Set(Component(0, 0, 2), Component(1, 2, 2), Component(2,2,3)),
      3 -> Set(Component(2, 2, 3), Component(3,3,4),Component(4,3,5)),
      4 -> Set(Component(3,3,4)),
      5 -> Set(Component(4,3,5)),
      9 -> Set(Component(7, 9,10)),
      10 -> Set(Component(7, 9,10), Component(6, 10, 1))
    ))

    bridges should contain(Seq(Component(5,0,1)))
    bridges should contain(Seq(Component(6, 10, 1), Component(5,0,1)))
    bridges should contain(Seq(Component(7, 9, 10), Component(6, 10, 1), Component(5, 0, 1)))
    bridges should contain(Seq(Component(0, 0, 2)))
    bridges should contain(Seq(Component(2, 2, 3), Component(0, 0, 2)))

    bridges should contain(Seq(Component(0, 0, 2), Component(2, 2, 3), Component(3, 3, 4)).reverse)
    bridges should contain(Seq(Component(0, 0, 2), Component(2, 2, 3), Component(4, 3, 5)).reverse)
    bridges should contain(Seq(Component(0, 0, 2), Component(1, 2, 2)).reverse)
    bridges should contain(Seq(Component(0, 0, 2), Component(1, 2, 2), Component(2, 2, 3)).reverse)
    bridges should contain(Seq(Component(0, 0, 2), Component(1, 2, 2), Component(2, 2, 3), Component(3, 3, 4)).reverse)
    bridges should contain(Seq(Component(0, 0, 2), Component(1, 2, 2), Component(2, 2, 3), Component(4, 3, 5)).reverse)
  }

  test("can score bridges") {
    scoreBridge(Seq(Component(5,0,1))) shouldBe 1
    scoreBridge(Seq(Component(6, 10, 1), Component(5,0,1))) shouldBe 12
    scoreBridge(Seq(Component(7, 9, 10), Component(6, 10, 1), Component(5, 0, 1))) shouldBe 31
    scoreBridge(Seq(Component(0, 0, 2))) shouldBe 2
    scoreBridge(Seq(Component(2, 2, 3), Component(0, 0, 2))) shouldBe 7
    scoreBridge(Seq(Component(0, 0, 2), Component(2, 2, 3), Component(3, 3, 4)).reverse) shouldBe 14
    scoreBridge(Seq(Component(0, 0, 2), Component(2, 2, 3), Component(4, 3, 5)).reverse) shouldBe 15
    scoreBridge(Seq(Component(0, 0, 2), Component(1, 2, 2)).reverse) shouldBe 6
    scoreBridge(Seq(Component(0, 0, 2), Component(1, 2, 2), Component(2, 2, 3)).reverse) shouldBe 11
    scoreBridge(Seq(Component(0, 0, 2), Component(1, 2, 2), Component(2, 2, 3), Component(3, 3, 4)).reverse) shouldBe 18
    scoreBridge(Seq(Component(0, 0, 2), Component(1, 2, 2), Component(2, 2, 3), Component(4, 3, 5)).reverse) shouldBe 19
  }

  test("can find strongest bridge") {
    strongestBridge(Map(
      0 -> Set(Component(0, 0, 2), Component(5, 0, 1)),
      1 -> Set(Component(6, 10, 1), Component(5, 0, 1)),
      2 -> Set(Component(0, 0, 2), Component(1, 2, 2), Component(2,2,3)),
      3 -> Set(Component(2, 2, 3), Component(3,3,4),Component(4,3,5)),
      4 -> Set(Component(3,3,4)),
      5 -> Set(Component(4,3,5)),
      9 -> Set(Component(7, 9,10)),
      10 -> Set(Component(7, 9,10), Component(6, 10, 1))
    )) shouldBe 31
  }
}
// defined class Day24Part1Test

(new Day24Part1Test).execute()
// Day24Part1Test:
// - can parse input
// - can build bridges
// - can score bridges
// - can find strongest bridge
```
{% endraw %}

I can then parse the test input and compute a result.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val components = parseInput(Source.fromResource("day24input.txt").getLines().toSeq)
// components: Map[Int,Set[Component]] = Map(0 -> Set(Component(12,0,45), Component(20,0,39), Component(32,0,43)), 5 -> Set(Component(7,5,5), Component(25,5,31), Component(31,44,5), Component(36,5,37)), 42 -> Set(Component(42,42,7)), 24 -> Set(Component(0,24,14), Component(1,30,24), Component(27,20,24), Component(37,40,24)), 37 -> Set(Component(3,47,37), Component(5,20,37), Component(36,5,37)), 14 -> Set(Component(0,24,14), Component(4,6,14), Component(6,14,45)), 20 -> Set(Component(5,20,37), Component(27,20,24), Component(33,38,20), Component(34,20,16)), 46 -> Set(Component(18,46,50), Component(54,46,17)), 29 -> Set(Component(2,29,44), Component(48,29,12), Component(55,29,29)), 6 -> Set(Component(4,6,14), Component(45,6,28)), 28 -> Set(Component(45,6,28)), 38 -> Set(Component(28,38,23), C...

strongestBridge(components)
// res1: Int = 2006
```
{% endraw %}

## Part 2

Since I'm already building all the bridges, I can re-run part one, but with a different comparator. As ties are broken
by strongest I can take advantage of scala already having and ordering defined for tuples of order by the first element,
then second, etc.

{% raw %}
```scala
def longestBridge(components: Map[Int, Set[Component]]): Int = {
  buildBridges(components)
  .map(b => (b.length, scoreBridge(b)))
  .max
  ._2
}
// longestBridge: (components: Map[Int,Set[Component]])Int

class Day24Part2Test extends FunSuite with Matchers {
  test("can find longest bridge") {
    longestBridge(Map(
      0 -> Set(Component(0, 0, 2), Component(5, 0, 1)),
      1 -> Set(Component(6, 10, 1), Component(5, 0, 1)),
      2 -> Set(Component(0, 0, 2), Component(1, 2, 2), Component(2,2,3)),
      3 -> Set(Component(2, 2, 3), Component(3,3,4),Component(4,3,5)),
      4 -> Set(Component(3,3,4)),
      5 -> Set(Component(4,3,5)),
      9 -> Set(Component(7, 9,10)),
      10 -> Set(Component(7, 9,10), Component(6, 10, 1))
    )) shouldBe 19
  }
}
// defined class Day24Part2Test

(new Day24Part2Test).execute()
// Day24Part2Test:
// - can find longest bridge

longestBridge(components)
// res3: Int = 1994
```
{% endraw %}