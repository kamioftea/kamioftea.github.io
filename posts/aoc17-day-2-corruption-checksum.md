---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Corruption Checksum
header: Corruption Checksum
date: 2017-12-09T05:00:00.000Z
updated: 2017-12-13T22:51:26.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 2](http://adventofcode.com/2017/day/2)

## Part 1 

I'm given a tab separated spreadsheet and need to calculate a checksum by 
finding the difference between the minimum and maximum of each line, and then 
summing those values.

First I'll make the input into something usable:

{% raw %}
```scala
val part1input = """5 1 9 5
                   |7 5 3
                   |2 4 6 8""".stripMargin
// part1input: String =
// 5 1 9 5
// 7 5 3
// 2 4 6 8

def parseRows(sheet: Seq[String]): Seq[Seq[Int]] =
    sheet.map(
      l => l.split("\\s").map(s => s.toInt).toSeq
    )
// parseRows: (sheet: Seq[String])Seq[Seq[Int]]

val part1sheet: Seq[Seq[Int]] = 
  parseRows(part1input.lines.toSeq)
// part1sheet: Seq[Seq[Int]] = Stream(WrappedArray(5, 1, 9, 5), ?)
```
{% endraw %}

Now I can try to calculate a checksum...

{% raw %}
```scala
def calcRowChecksum(row: Seq[Int]): Int = {
    val (rowMin, rowMax) = row.foldLeft((Int.MaxValue, Int.MinValue)){
      case ((min, max), cell) => (Math.min(min, cell), Math.max(max, cell))
    }
    
    rowMax - rowMin
}
// calcRowChecksum: (row: Seq[Int])Int

def calcSheetChecksum(sheet: Seq[Seq[Int]]): Int = 
  sheet.map(calcRowChecksum).sum
// calcSheetChecksum: (sheet: Seq[Seq[Int]])Int
```
{% endraw %}

...and check my working using the examples in the puzzle:

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day2Part1Test extends FunSuite with Matchers {
  
  test("Can calculate per row checksums") {
    calcRowChecksum(part1sheet(0)) shouldBe 8
    calcRowChecksum(part1sheet(1)) shouldBe 4
    calcRowChecksum(part1sheet(2)) shouldBe 6
  }
  
  test("Can calculate whole sheet checksums") { 
    calcSheetChecksum(part1sheet) shouldBe 18
  }
}
// defined class Day2Part1Test

(new Day2Part1Test).execute()
// Day2Part1Test:
// - Can calculate per row checksums
// - Can calculate whole sheet checksums
```
{% endraw %}

Finally I can pass in the puzzle input and get an answer.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val puzzleSheet = parseRows(
  Source.fromResource("day2input.txt").getLines().toSeq
)
// puzzleSheet: Seq[Seq[Int]] = Stream(WrappedArray(3751, 3769, 2769, 2039, 2794, 240, 3579, 1228, 4291, 220, 324, 3960, 211, 1346, 237, 1586), ?)

calcSheetChecksum(puzzleSheet)
// res1: Int = 36174
```
{% endraw %}

## Part 2

It turns out what I actually need to do is find the two evenly divisible 
numbers on each row, and sum the common factor.

{% raw %}
```scala
def findDivisor(needle: Int, haystack: Seq[Int]): Option[Int] = haystack match {
  case Nil => None
  case h +: _ if (needle % h) == 0 => Some(needle / h)
  case h +: _ if (h % needle) == 0 => Some(h / needle)
  case _ +: rest => findDivisor(needle, rest)
}
// findDivisor: (needle: Int, haystack: Seq[Int])Option[Int]

def findFactor(row: Seq[Int]): Int = row match {
  case Nil => 0 // Should never occur with out input
  case h +: t => 
    val maybeDivisor = findDivisor(h, t)
    
    // Would normally use getOrElse but the compiler can't detect that as
    // tail recursive
    if(maybeDivisor.isDefined) maybeDivisor.get
    else findFactor(t)
}
// findFactor: (row: Seq[Int])Int

def sumFactors(sheet: Seq[Seq[Int]]) = sheet.map(findFactor).sum
// sumFactors: (sheet: Seq[Seq[Int]])Int
```
{% endraw %}

There is different test input for this, and some more examples:

{% raw %}
```scala
val part2input = """5 9 2 8
                   |9 4 7 3
                   |3 8 6 5""".stripMargin
// part2input: String =
// 5 9 2 8
// 9 4 7 3
// 3 8 6 5

val part2sheet: Seq[Seq[Int]] = 
  parseRows(part2input.lines.toSeq)
// part2sheet: Seq[Seq[Int]] = Stream(WrappedArray(5, 9, 2, 8), ?)

class Day2Part2Test extends FunSuite with Matchers {
  
  test("Can calculate per row factors") {
    findFactor(part2sheet(0)) shouldBe 4
    findFactor(part2sheet(1)) shouldBe 3
    findFactor(part2sheet(2)) shouldBe 2
  }
  
  test("Can calculate the sum of the sheet's factors") { 
    sumFactors(part2sheet) shouldBe 9
  }
}
// defined class Day2Part2Test

(new Day2Part2Test).execute()
// Day2Part2Test:
// - Can calculate per row factors
// - Can calculate the sum of the sheet's factors
```
{% endraw %}

Putting it all together

{% raw %}
```scala
sumFactors(puzzleSheet)
// res3: Int = 244
```
{% endraw %}