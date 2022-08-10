---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Fractal Art
header: Fractal Art
date: 2017-12-28T05:00:00.000Z
updated: 2018-01-03T23:17:14.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 21](http://adventofcode.com/2017/day/21)

## Part 1

Firstly I need to be able to parse the input into something useful, and it would be useful to do the rotation/flipping
of the input here so that finding the correct successor image for any pattern is a simple map lookup. Helpfully the
Scala collections library provides a transpose for me, and with some implicit magic I can make it fairly clear what is
happening.

{% raw %}
```scala
implicit class MatrixOps[T](m: Vector[Vector[T]]) {
  def flip: Vector[Vector[T]] = m.map(_.reverse)
  def rot: Vector[Vector[T]] = m.transpose.flip
}
// defined class MatrixOps

def explode(base: Vector[Vector[Char]]): Seq[Vector[Vector[Char]]] = {
  Seq(
    base,
    base.flip,
    base.rot,
    base.rot.flip,
    base.rot.rot,
    base.rot.rot.flip,
    base.rot.rot.rot,
    base.rot.rot.rot.flip
  )
}
// explode: (base: Vector[Vector[Char]])Seq[Vector[Vector[Char]]]

def parseInput(lines: TraversableOnce[String]): Map[Vector[Vector[Char]], Vector[Vector[Char]]] = {
  lines.flatMap(
    l => {
      val (base +: result +: _) =
        l.split(" => ")
          .map(r => r.split("/").toVector.map(_.toVector))
          .toSeq

      explode(base).map(_ -> result)
    }
  ).toMap
}
// parseInput: (lines: TraversableOnce[String])Map[Vector[Vector[Char]],Vector[Vector[Char]]]
```
{% endraw %}

With that in place, I can now perform the enhancement rounds. I can use for-comprehensions to make the looping through
the sub-images, doing the pattern lookup. I also then split the output pattern into single characters, allowing me to
build the new image one bit at a time.

{% raw %}
```scala
def expand(grid: Vector[Vector[Char]],
           book: Map[Vector[Vector[Char]], Vector[Vector[Char]]],
           rounds: Int): Vector[Vector[Char]] = {

  def _doExpand(i: Int): Vector[Vector[Char]] = {
    val newWidth = (grid(0).length / i) * (i + 1)
    (for {
      x <- 0 until grid(0).length / i
      y <- 0 until grid(0).length / i
      (img, a) <- book(
        (0 until i).map(j =>
          grid((i * x) + j).slice(i * y, (i * y) + i)
        ).toVector
      ).zipWithIndex
      (ch, b) <- img.zipWithIndex
    } yield (x, y, ch, a, b)).foldLeft(Vector.fill(newWidth, newWidth)(' ')) {
      case (acc, (x, y, ch, a, b)) =>
        acc.updated(
          x * (i + 1) + a,
          acc((x * (i + 1)) + a).updated(
            y * (i + 1) + b,
            ch
          )
        )
    }
  }


  if (rounds == 0) grid
  else {
    if (grid(0).length % 2 == 0)
      expand(_doExpand(2), book, rounds - 1)
    else
      expand(_doExpand(3), book, rounds - 1)
  }
}
// expand: (grid: Vector[Vector[Char]], book: Map[Vector[Vector[Char]],Vector[Vector[Char]]], rounds: Int)Vector[Vector[Char]]
```
{% endraw %}

Finally I need to count the pixels in the expanded image to be able to answer the puzzle.

{% raw %}
```scala
def countPixels(grid: Vector[Vector[Char]],
                book: Map[Vector[Vector[Char]], Vector[Vector[Char]]],
                rounds: Int): Int = {
  expand(grid, book, rounds).map(_.count(_ == '#')).sum
}
// countPixels: (grid: Vector[Vector[Char]], book: Map[Vector[Vector[Char]],Vector[Vector[Char]]], rounds: Int)Int
```
{% endraw %}

There are quite a few steps to this, so also a fairly large set of tests. Mostly these are derived from the example
given.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day21Part1Test extends FunSuite with Matchers {

  test("can malipulate vectors")
  {
    Vector("#.".toVector, "##".toVector).flip shouldBe Vector(".#".toVector, "##".toVector)
    Vector("#.".toVector, "##".toVector).rot shouldBe Vector("##".toVector, "#.".toVector)
    Vector("#.".toVector, "##".toVector).rot.rot shouldBe Vector("##".toVector, ".#".toVector)
    Vector("#.".toVector, "##".toVector).rot.rot.rot shouldBe Vector(".#".toVector, "##".toVector)
    Vector("#.".toVector, "##".toVector).rot.rot.rot.rot shouldBe Vector("#.".toVector, "##".toVector)
  }

  test("can parse input") {
    parseInput(Seq(
      "##/#. => .../.##/##.",
      "##/## => ###/#../#.."
    )) shouldBe Map(
      Vector("##".toVector, "#.".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector(".#".toVector, "##".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector("#.".toVector, "##".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector("##".toVector, ".#".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector("##".toVector, "##".toVector) -> Vector("###".toVector, "#..".toVector, "#..".toVector)
    )
    parseInput(Seq(
      ".../.../... => .#../.#../#..#/##..",
      "#../.../... => ####/####/.###/####"
    )) shouldBe Map(
      Vector("...".toVector, "...".toVector, "...".toVector) -> Vector(".#..".toVector, ".#..".toVector, "#..#".toVector, "##..".toVector),
      Vector("#..".toVector, "...".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("..#".toVector, "...".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "...".toVector, "#..".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "...".toVector, "..#".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector)
    )
    parseInput(Seq(
      ".../.../... => .#../.#../#..#/##..",
      "##./.../... => ####/####/.###/####"
    )) shouldBe Map(
      Vector("...".toVector, "...".toVector, "...".toVector) -> Vector(".#..".toVector, ".#..".toVector, "#..#".toVector, "##..".toVector),
      Vector("##.".toVector, "...".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector(".##".toVector, "...".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "...".toVector, "##.".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "...".toVector, ".##".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("..#".toVector, "..#".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("#..".toVector, "#..".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "#..".toVector, "#..".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "..#".toVector, "..#".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector)
    )

    parseInput(Seq(
      "##/#. => .../.##/##.",
      "##/## => ###/#../#..",
      ".../.../... => .#../.#../#..#/##..",
      "#../.../... => ####/####/.###/####"
    )) shouldBe Map(
      Vector("##".toVector, "#.".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector(".#".toVector, "##".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector("#.".toVector, "##".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector("##".toVector, ".#".toVector) -> Vector("...".toVector, ".##".toVector, "##.".toVector),
      Vector("##".toVector, "##".toVector) -> Vector("###".toVector, "#..".toVector, "#..".toVector),
      Vector("...".toVector, "...".toVector, "...".toVector) -> Vector(".#..".toVector, ".#..".toVector, "#..#".toVector, "##..".toVector),
      Vector("#..".toVector, "...".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("..#".toVector, "...".toVector, "...".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "...".toVector, "#..".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector),
      Vector("...".toVector, "...".toVector, "..#".toVector) -> Vector("####".toVector, "####".toVector, ".###".toVector, "####".toVector)
    )
  }

  private val book = parseInput(Seq(
    "../.# => ##./#../...",
    ".#./..#/### => #..#/..../..../#..#"
  ))

  private val base = Vector(
    ".#.",
    "..#",
    "###"
  ).map(_.toVector)

  test("can expand image") {
    expand(base, book, 1) shouldBe Vector(
      "#..#",
      "....",
      "....",
      "#..#"
    ).map(_.toVector)

    expand(base, book, 2) shouldBe Vector(
      "##.##.",
      "#..#..",
      "......",
      "##.##.",
      "#..#..",
      "......"
    ).map(_.toVector)
  }


  test("can count pixels image") {
    countPixels(base, book, 2) shouldBe 12
  }
}
// defined class Day21Part1Test

(new Day21Part1Test).execute()
// Day21Part1Test:
// - can malipulate vectors
// - can parse input
// - can expand image
// - can count pixels image
```
{% endraw %}

I can then plug in my puzzle input to get the 'book' of enhancements to apply,
and run the process.

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val input = parseInput(Source.fromResource("day21input.txt").getLines())
// input: Map[Vector[Vector[Char]],Vector[Vector[Char]]] = Map(Vector(Vector(#, .), Vector(., #)) -> Vector(Vector(., ., #), Vector(., #, .), Vector(., ., #)), Vector(Vector(., ., #), Vector(., #, .), Vector(., #, .)) -> Vector(Vector(., ., #, .), Vector(#, ., ., .), Vector(#, #, ., .), Vector(#, #, #, .)), Vector(Vector(., #, .), Vector(., ., .), Vector(#, ., #)) -> Vector(Vector(#, ., #, .), Vector(#, ., ., #), Vector(#, #, #, .), Vector(., #, #, .)), Vector(Vector(#, #, #), Vector(., #, #), Vector(., ., #)) -> Vector(Vector(., #, #, #), Vector(., #, #, .), Vector(#, ., #, #), Vector(., ., #, #)), Vector(Vector(., ., #), Vector(., #, #), Vector(#, ., .)) -> Vector(Vector(#, ., #, .), Vector(., #, #, .), Vector(., #, #, #), Vector(#, ., #, .)), Vector(Vector(., #, #), Vector(., ., #), Vec...

val base = Vector(
  ".#.",
  "..#",
  "###"
).map(_.toVector)
// base: scala.collection.immutable.Vector[Vector[Char]] = Vector(Vector(., #, .), Vector(., ., #), Vector(#, #, #))

countPixels(base, input, 5)
// res1: Int = 139
```
{% endraw %}

## Part 2

Part 2 was just part 1 again on a larger scale. I suspect there is some trick to notice that sections of the image are
repeated and that could reduce the problem to a smaller size. However, pluging the extra enhancement rounds into my
solution above still produced the answer in seconds, so I left it at that.

{% raw %}
```scala
countPixels(base, input, 18)
// res2: Int = 1857134
```
{% endraw %}
