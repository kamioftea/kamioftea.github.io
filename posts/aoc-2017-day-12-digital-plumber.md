---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Digital Plumber
header: Digital Plumber
date: 2017-12-19T05:00:00.000Z
updated: 2017-12-20T00:38:04.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 12](http://adventofcode.com/2017/day/12)

## Part 1

Today's challenge is essentially a clustering problem. Before I can solve it, I'll need the puzzle input in a useful
format. I pondered processing the input a line at a time, but it seemed I would get a simpler implementation from
'walking' around the graph. To do this I need to look up nodes by index, so parsing the whole file into a Vector seemed
more suitable.

{% raw %}
```scala
import scala.collection.BitSet
// import scala.collection.BitSet

val LineMatcher = "^\\d+ <-> ((?:\\d+(?:, )?)+)$".r
// LineMatcher: scala.util.matching.Regex = ^\d+ <-> ((?:\d+(?:, )?)+)$

def parseInput(lines: TraversableOnce[String]): Vector[Set[Int]] =
  lines.toVector.collect {
    case LineMatcher(edges) => edges.split(", ").map(_.toInt).toSet
  }
// parseInput: (lines: TraversableOnce[String])Vector[Set[Int]]
```
{% endraw %}

I now need to wander around the graph finding all the connected nodes starting with element 0. The edges being
undirected and both nodes having the information about the edge to other one means I can just keep adding all a nodes
children to my list to check, and discard any I've seen before. I can use a Set to keep track of visited nodes and when
I have no more to check, the size of the set is also the solution to the puzzle.

{% raw %}
```scala
def clusterWith(root: Int, edges: Vector[Set[Int]]): BitSet = {
  def iter(linkedEdges: Seq[Int], matches: BitSet): BitSet = linkedEdges match {
    case Nil => matches
    case e +: es if matches.contains(e) => iter(es, matches)
    case e +: es => iter(es ++ edges(e), matches + e)
  }

  iter(edges(root).toSeq, BitSet(root))
}
// clusterWith: (root: Int, edges: Vector[Set[Int]])scala.collection.BitSet
```
{% endraw %}

For testing there was only one sample in the puzzle description. This was simple
to tweak into a set of test cases.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day12Part1Test extends FunSuite with Matchers {
  test("Can parse input") {
    parseInput(
      """0 <-> 2
        |1 <-> 1
        |2 <-> 0, 3, 4
        |3 <-> 2, 4
        |4 <-> 2, 3, 6
        |5 <-> 6
        |6 <-> 4, 5""".stripMargin.lines
    ) shouldBe Vector(
      Set(2),
      Set(1),
      Set(0, 3, 4),
      Set(2, 4),
      Set(2, 3, 6),
      Set(6),
      Set(4, 5)
    )
  }

  test("Can find size of cluster") {
    clusterWith(
      0,
      Vector(
        Set(2),
        Set(1),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3, 6),
        Set(6),
        Set(4, 5)
      )
    ).size shouldBe 6

    clusterWith(
      0,
      Vector(
        Set(2),
        Set(1),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3),
        Set(6),
        Set(5)
      )
    ).size shouldBe 4

    clusterWith(
      0,
      Vector(
        Set(2),
        Set(6),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3),
        Set(6),
        Set(1, 5)
      )
    ).size shouldBe 4

    clusterWith(
      0,
      Vector(
        Set(2),
        Set(6),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3),
        Set(6),
        Set(1, 5)
      )
    ).size shouldBe 4

    clusterWith(
      1,
      Vector(
        Set(2),
        Set(6),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3),
        Set(6),
        Set(1, 5)
      )
    ).size shouldBe 3
  }
}
// defined class Day12Part1Test

(new Day12Part1Test).execute()
// Day12Part1Test:
// - Can parse input
// - Can find size of cluster
```
{% endraw %}

I originally had the start node and the returning of the size of the set built into clusterWith, but extracted it when I
needed the full set for any node for part 2.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

def input = parseInput(Source.fromResource("day12input.txt").getLines())
// input: Vector[Set[Int]]

clusterWith(0, input).size
// res1: Int = 145
```
{% endraw %}

## Part 2

Given that I had part 1 written, the easiest solution would be to reuse its feature of building a set of connected
nodes. As I go through the nodes in order if it's in a cluster I've already seen I can ignore it and continue. If
instead it is new, use part 1 to find the rest of its cluster and add those to the list of covered nodes. If increment a
counter each time I do this I then have the puzzle solution.

{% raw %}
```scala
def countClusters(edges: Vector[Set[Int]]): Int = {
  def iter(toProcess: Seq[Int], matches: BitSet, count: Int): Int = toProcess match {
    case Nil => count
    case e +: es if matches.contains(e) => iter(es, matches, count)
    case e +: es => iter(es, matches ++ clusterWith(e, edges), count + 1)
  }

  iter(edges.indices, BitSet.empty, 0)
}
// countClusters: (edges: Vector[Set[Int]])Int
```
{% endraw %}
The example from part one is not amazing for testing this part. The nodes are all connected except one, which is only
connected to itself. I built a few with multiple multi node clusters and also some simple base cases.

{% raw %}
```scala
class Day12Part2Test extends FunSuite with Matchers {
  test("Can count clusters") {
    countClusters(
      Vector(
        Set(2),
        Set(1),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3, 6),
        Set(6),
        Set(4, 5)
      )
    ) shouldBe 2
  
    countClusters(
      Vector(
        Set(0)
      )
    ) shouldBe 1
  
    countClusters(
      Vector(
        Set(1),
        Set(0)
      )
    ) shouldBe 1
  
    countClusters(
      Vector(
        Set(0),
        Set(1)
      )
    ) shouldBe 2
  
    countClusters(
      Vector(
        Set(1, 2),
        Set(0),
        Set(0)
      )
    ) shouldBe 1
  
    countClusters(
      Vector(
        Set(0),
        Set(1),
        Set(2)
      )
    ) shouldBe 3
  
    countClusters(
      Vector(
        Set(2),
        Set(6),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3),
        Set(6),
        Set(1, 5)
      )
    ) shouldBe 2
  
    countClusters(
      Vector(
        Set(2),
        Set(1),
        Set(0, 3, 4),
        Set(2, 4),
        Set(2, 3),
        Set(6),
        Set(5)
      )
    ) shouldBe 3
  
    countClusters(
      Vector(
        Set(2),
        Set(3),
        Set(0, 4),
        Set(1),
        Set(2),
        Set(6),
        Set(5)
      )
    ) shouldBe 3
  
  }
}
// defined class Day12Part2Test

(new Day12Part2Test).execute()
// Day12Part2Test:
// - Can count clusters
```
{% endraw %}

And this can now process the puzzle input.

{% raw %}
```scala
countClusters(input)
// res3: Int = 207
```
{% endraw %}