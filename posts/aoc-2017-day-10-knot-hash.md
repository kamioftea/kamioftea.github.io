---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: Knot Hash
header: Knot Hash
date: 2017-12-17T05:00:00.000Z
updated: 2017-12-17T05:00:00.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
A solution for [Advent of Code 2017 - Day 10](http://adventofcode.com/2017/day/10)

## Part 1

The first part of today's task is to implement a round of a convoluted hashing algorithm inspired by trying to represent
the act of knotting a sequence of integers.

My code is mostly just following the recipe provided. It is in two parts as part two turns out to require re-running the
algorithm multiple times, passing on some of the internal state. The second function is merely a wrapper round the
implementation that formats the output correctly.

{% raw %}
```scala
def hashRound(lengths: List[Int],
              hash: Vector[Int],
              position: Int = 0,
              skipSize: Int = 0): (Vector[Int], Int, Int) = {
  lengths match {
    case Nil => (hash, position, skipSize)
    case h :: t =>
      val newHash =
        if (position + h < hash.length) {
          val (pre, rest) = hash.splitAt(position)
          val (mid, post) = rest.splitAt(h)

          pre ++ mid.reverse ++ post
        }
        else {
          val (rest, end) = hash.splitAt(position)
          val (start, mid) = rest.splitAt((position + h) % hash.length)
          val (rEnd, rStart) = (end ++ start).reverse.splitAt(end.length)

          rStart ++ mid ++ rEnd
        }

      hashRound(
        t,
        newHash,
        (position + h + skipSize) % hash.length,
        skipSize + 1
      )
  }
}
// hashRound: (lengths: List[Int], hash: Vector[Int], position: Int, skipSize: Int)(Vector[Int], Int, Int)

def hash(lengths: List[Int],
         listSize: Int,
         position: Int = 0,
         skipSize: Int = 0): Vector[Int] =
  hashRound(lengths, Vector.range(0, listSize))._1
// hash: (lengths: List[Int], listSize: Int, position: Int, skipSize: Int)Vector[Int]
``` 
{% endraw %}

I could have used a single formula to calculate the new position using modulus calculations to treat is at a continuous
list, but it would have been much harder to understand what it was doing if I need to revisit this code.

There was only one example, but since it is recursive I can use the sub-steps to add in some extra test cases.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day10Part1Test extends FunSuite with Matchers {
  test("can hash sequence") {
    hash(List(), 5) shouldBe Vector(0, 1, 2, 3, 4)
    hash(List(3), 5) shouldBe Vector(2, 1, 0, 3, 4)
    hash(List(3, 4), 5) shouldBe Vector(4, 3, 0, 1, 2)
    hash(List(3, 4, 1), 5) shouldBe Vector(4, 3, 0, 1, 2)
    hash(List(3, 4, 1, 5), 5) shouldBe Vector(3, 4, 2, 1, 0)
  }
}
// defined class Day10Part1Test

(new Day10Part1Test).execute()
// Day10Part1Test:
// - can hash sequence
```
{% endraw %}

The input can now be hashed, and the solution required was the first two values multiplied together.

{% raw %}
```scala
val input = "197,97,204,108,1,29,5,71,0,50,2,255,248,78,254,63"
// input: String = 197,97,204,108,1,29,5,71,0,50,2,255,248,78,254,63

val output = hash(input.split(",").map(_.toInt).toList, 256)
// output: Vector[Int] = Vector(158, 254, 196, 195, 194, 193, 192, 191, 190, 189, 188, 151, 152, 153, 154, 155, 156, 157, 247, 246, 11, 10, 9, 8, 7, 6, 5, 4, 3, 2, 1, 0, 159, 160, 161, 162, 163, 164, 165, 166, 167, 168, 169, 170, 171, 172, 173, 174, 175, 176, 177, 178, 179, 180, 181, 182, 183, 184, 185, 186, 187, 150, 149, 148, 147, 146, 145, 144, 143, 142, 141, 140, 139, 138, 137, 136, 65, 66, 67, 68, 69, 70, 71, 72, 73, 74, 75, 76, 77, 78, 79, 80, 81, 82, 83, 84, 85, 86, 87, 88, 89, 90, 91, 92, 93, 94, 95, 96, 97, 98, 99, 100, 101, 102, 103, 104, 105, 106, 107, 108, 109, 110, 111, 112, 113, 114, 115, 116, 117, 118, 119, 120, 121, 122, 123, 124, 125, 126, 127, 128, 129, 130, 131, 132, 133, 134, 135, 64, 63, 62, 61, 60, 59, 54, 56, 55, 57, 58, 53, 52, 51, 50, 49, 20, 21, 22, 23, 201, 38, 3...

output(0) * output(1)
// res1: Int = 40132
```
{% endraw %}
## Part 2

This is quite an extension on the above, and make the output look more like a hash, even if that is just because it is
more efficient to display binary data as hexadecimal characters so by their nature of having no inherent structure
themselves, hexadecimal strings is the default output.

Whilst a lot more work is done by the computer, the actual task is still just following a recipe

{% raw %}
```scala
def knotHash(input: String, listSize: Int = 256): String = {
  val lengths = input.toList.map(_.toInt) ++ List(17, 31, 73, 47, 23)
  val (sparseHash, _, _) =
    (0 until 64)
      .foldLeft((Vector.range(0, listSize), 0, 0)) {
        case ((h, p, s), _) => hashRound(lengths, h, p, s)
      }

  sparseHash
    .grouped(16)
    .map(_.reduce(_ ^ _))
    .map("%02x".format(_))
    .mkString
}
// knotHash: (input: String, listSize: Int)String
```
{% endraw %}

With this part having many more steps a walk-through isn't provided. There are however a few test cases.

{% raw %}
```scala
class Day10Part2Test extends FunSuite with Matchers {
  test("can run full knot hash")
  {
    knotHash("") shouldBe "a2582a3a0e66e6e86e3812dcb672a272"
    knotHash("AoC 2017") shouldBe "33efeb34ea91902bb2f59c9920caa6cd"
    knotHash("1,2,3") shouldBe "3efbe78a8d82f29979031a4aa0b16a9d"
    knotHash("1,2,4") shouldBe "63960835bcdc130f0b66d7ff4f6a5a8e"
  }
}
// defined class Day10Part2Test

(new Day10Part2Test).execute()
// Day10Part2Test:
// - can run full knot hash
```
{% endraw %}

The input can now be hashed, giving me my second solution

{% raw %}
```scala
knotHash(input)
// res3: String = 35b028fe2c958793f7d5a61d07a008c8
```
{% endraw %}