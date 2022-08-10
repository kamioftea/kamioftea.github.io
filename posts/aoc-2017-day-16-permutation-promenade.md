---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Permutation Promenade
header: Permutation Promenade
date: 2017-12-23T05:00:00.000Z
updated: 2017-12-23T05:00:00.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 16](http://adventofcode.com/2017/day/16)

## Part 1

Part one is effectively just parsing the input.

{% raw %}
```scala
val Spin = "s(\\d+)".r
// Spin: scala.util.matching.Regex = s(\d+)

val Exchange = "x(\\d+)/(\\d+)".r
// Exchange: scala.util.matching.Regex = x(\d+)/(\d+)

val Partner = "p([a-z])/([a-z])".r
// Partner: scala.util.matching.Regex = p([a-z])/([a-z])

def applyInstruction(instruction: String, programs: Vector[Char]): Vector[Char] =
  instruction match {
    case Spin(n) => programs.takeRight(n.toInt) ++ programs.dropRight(n.toInt)
    case Exchange(a,b) =>
      programs
        .updated(a.toInt, programs(b.toInt))
        .updated(b.toInt, programs(a.toInt))
    case Partner(a, b) =>
      programs
          .updated(programs.indexOf(a.charAt(0)), b.charAt(0))
          .updated(programs.indexOf(b.charAt(0)), a.charAt(0))

  }
// applyInstruction: (instruction: String, programs: Vector[Char])Vector[Char]

def applyInstructions(instructions: Array[String], programs: Vector[Char]): Vector[Char] =
  instructions.foldLeft(programs){ case( ps, i) => applyInstruction(i, ps) }
// applyInstructions: (instructions: Array[String], programs: Vector[Char])Vector[Char]
```
{% endraw %}

This assumes the input string has already been split on commas. The examples given in the instructions convert nicely to
test cases.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day16Part1Test extends FunSuite with Matchers {

  test("can apply an instruction") {
    applyInstruction("s1", "abcde".toVector) shouldBe "eabcd".toVector
    applyInstruction("x3/4", "eabcd".toVector) shouldBe "eabdc".toVector
    applyInstruction("pe/b", "eabdc".toVector) shouldBe "baedc".toVector
  }

  test("can apply program") {
    applyInstructions("s1,x3/4,pe/b".split(','), "abcde".toVector) shouldBe "baedc".toVector
  }
}
// defined class Day16Part1Test

(new Day16Part1Test).execute()
// Day16Part1Test:
// - can apply an instruction
// - can apply program
```
{% endraw %}

Running with the puzzle input gives the correct output.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val input = Source.fromResource("day16input.txt").mkString.trim.split(',')
// input: Array[String] = Array(x6/13, pk/n, x9/2, pl/o, x12/1, pm/n, s10, x13/7, s7, x1/11, s9, x13/10, pa/d, x5/9, s12, x10/4, s5, x0/7, s11, x12/6, s6, x9/14, s15, x8/5, s14, x9/6, s11, x5/15, ph/c, x4/8, pj/m, x6/14, s11, x11/7, s13, x0/1, s9, x6/8, s6, pg/b, s13, x14/11, pa/i, x15/4, s6, x12/2, pg/c, s9, x13/3, s13, x10/15, pk/a, x7/12, s6, x5/6, s5, x1/0, pp/f, x12/15, s4, x1/10, pl/e, x0/7, s4, x9/11, s13, x12/3, pi/c, s13, x8/10, pd/m, x3/15, pf/n, s7, x1/11, s9, x2/0, pi/d, x1/15, s2, x9/8, s11, x11/13, pg/l, x9/0, pd/j, x8/10, pk/o, x7/3, s4, x2/8, pg/j, x13/4, s6, x9/2, pk/p, s8, po/b, x14/13, s7, x8/12, s4, x11/10, s3, pp/j, x3/14, pe/l, x11/8, s10, x4/2, s15, x0/7, s13, x14/5, pf/i, x0/7, s4, x15/12, pc/p, s10, x11/13, pe/m, x14/12, s4, x5/1, pp/f, x4/3, pm/h, x14/8, pe/a, x15...

applyInstructions(input, "abcdefghijklmnop".toVector).mkString
// res1: String = cknmidebghlajpfo
```
{% endraw %}

## Part 2

Part two is a bit trickier. I must admit I tried just running the program a billion times, but it was going nowhere
fast. I then noted that hopefully the output would eventually repeat. I already had a function that could find the loop
size of a repeating program. I needed to make it work with strings, and since I was reusing it I made it generic.

{% raw %}
```scala
def countLoopSize[T](sequence: Vector[T], update: Vector[T] => Vector[T]): (Int, Int, Map[Vector[T], Int]) = {
  def iter(state: Vector[T],
           seen: Map[Vector[T], Int] = Map.empty,
           count: Int = 0): (Int, Int, Map[Vector[T], Int]) =
    if (seen.isDefinedAt(state)) (count, count - seen(state), seen)
    else iter(update(state), seen.updated(state, count), count + 1)
    
  iter(sequence)
}
// countLoopSize: [T](sequence: Vector[T], update: Vector[T] => Vector[T])(Int, Int, Map[Vector[T],Int])
```
{% endraw %}

I could then use the output from that to work out at what point round the loop the programs would be after 1 billion
iterations.

{% raw %}
```scala
def applyRepeatInstructions(n: Int, instructions: Array[String], programs: Vector[Char]): Vector[Char] = {
  val (count, loopSize, seen) = countLoopSize(programs, (ps:Vector[Char]) => applyInstructions(instructions, ps))
  val prefix = count - loopSize

  seen.find { case (_, i) => i == prefix + ((n - prefix) % loopSize)}.get._1
}
// applyRepeatInstructions: (n: Int, instructions: Array[String], programs: Vector[Char])Vector[Char]
```
{% endraw %}

I don't really have sample looping data to test this scenario, but I can ensure the refactor of countLoopSize works by
running the Day 6 test case through the new function.



{% raw %}
```scala
class Day16Part2Test extends FunSuite with Matchers {
  test("refactor count loop size") {
      countLoopSize(Vector(0, 2, 7, 0), Day6.redistribute)._2 shouldBe 4
      countLoopSize(Vector(2, 4, 1, 2), Day6.redistribute)._2 shouldBe 4
      countLoopSize(Vector(3, 1, 2, 3), Day6.redistribute)._2 shouldBe 4
      countLoopSize(Vector(23), Day6.redistribute)._2 shouldBe 1
      countLoopSize(Vector(4, 2), Day6.redistribute)._2 shouldBe 2
      countLoopSize(Vector(5, 1), Day6.redistribute)._2 shouldBe 2
  }
}
// defined class Day16Part2Test

(new Day16Part2Test).execute()
// Day16Part2Test:
// - refactor count loop size
```
{% endraw %}

Now I run today's input through the loop counter and hope that it does in fact repeat (spoiler: it does).

{% raw %}
```scala
applyRepeatInstructions(1000000000, input, "abcdefghijklmnop".toVector).mkString
// res3: String = cbolhmkgfpenidaj
```
{% endraw %}