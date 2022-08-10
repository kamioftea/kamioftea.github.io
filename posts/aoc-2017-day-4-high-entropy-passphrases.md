---
tags:
  - post
  - advent-of-code-2017
  - coding
  - scala
title: High-Entropy Passphrases
header: High-Entropy Passphrases
date: 2017-12-11T05:00:00.000Z
updated: 2017-12-14T21:39:41.000Z
eleventyExcludeFromCollections: false
coverImage: https://static.goblinoid.co.uk/jeff-horton.uk/e1bd99e2-5071-4d00-87ac-d3c2f5005c9c.png
---
# High-Entropy Passphrases

A solution for [Advent of Code 2017 - Day 4](http://adventofcode.com/2017/day/4)

## Part 1

Today's goal is to throw out a bunch of insecure passphrases. Specifically those with duplicate words. I can see Sets
being my friend.

{% raw %}
```scala
def iterSecure(words: List[String], seen: Set[String] = Set.empty): Boolean = (
  words match {
    case Nil => true
    case word :: _ if seen.contains(word) => false
    case word :: rest => iterSecure(rest, seen + word)
  }
)
// iterSecure: (words: List[String], seen: Set[String])Boolean

def isSecure(passphrase: String): Boolean = iterSecure(passphrase.split(" ").toList, Set.empty)
// isSecure: (passphrase: String)Boolean

def countSecure(passphrases: Seq[String]): Int = passphrases.count(isSecure)
// countSecure: (passphrases: Seq[String])Int
```
{% endraw %}

The recursive `iterSecure` was originally written inside isSecure as just iter. A pattern I often use that keeps the
implementation-only arguments in the recursion hidden from the outside world. It then turned out part two needed to call
it in a subtly different way, so I lifted it out to a def.

There were some examples to use as test cases.

{% raw %}
```scala
import org.scalatest.{FunSuite, Matchers}
// import org.scalatest.{FunSuite, Matchers}

class Day4Part1Test extends FunSuite with Matchers {

  test("can test a phrase is secure") {
    isSecure("aa bb cc dd ee") shouldBe true
    isSecure("aa bb cc dd aa") shouldBe false
    isSecure("aa bb cc dd aaa") shouldBe true
    isSecure("ab") shouldBe true
    isSecure("a b") shouldBe true
    isSecure("a a") shouldBe false
    isSecure("a a a") shouldBe false

    isSecure("sayndz zfxlkl attjtww cti sokkmty brx fhh suelqbp") shouldBe true
    isSecure("xmuf znkhaes pggrlp zia znkhaes znkhaes") shouldBe false
    isSecure("nti rxr bogebb zdwrin") shouldBe true
    isSecure("sryookh unrudn zrkz jxhrdo gctlyz") shouldBe true
    isSecure("bssqn wbmdc rigc zketu ketichh enkixg bmdwc stnsdf jnz mqovwg ixgken") shouldBe true
    isSecure("flawt cpott xth ucwgg xce jcubx wvl qsysa nlg") shouldBe true

  }

  test("can count secure phrases") {
    countSecure(Seq("aa bb")) shouldBe 1
    countSecure(Seq("aa bb", "aa bb")) shouldBe 2
    countSecure(Seq("aa aa", "aa aa")) shouldBe 0
    countSecure(Seq("aa aa", "aa bb")) shouldBe 1
    countSecure(Seq("aa bb")) shouldBe 1

    countSecure(Seq(
      "aa bb cc dd ee",
      "aa bb cc dd aa",
      "aa bb cc dd aaa",
      "ab",
      "a b",
      "a a",
      "a a a"
    )) shouldBe 4

    countSecure(Seq(
      "sayndz zfxlkl attjtww cti sokkmty brx fhh suelqbp",
      "xmuf znkhaes pggrlp zia znkhaes znkhaes",
      "nti rxr bogebb zdwrin",
      "sryookh unrudn zrkz jxhrdo gctlyz",
      "bssqn wbmdc rigc zketu ketichh enkixg bmdwc stnsdf jnz mqovwg ixgken",
      "flawt cpott xth ucwgg xce jcubx wvl qsysa nlg"
    )) shouldBe 5

  }
}
// defined class Day4Part1Test

(new Day4Part1Test).execute()
// Day4Part1Test:
// - can test a phrase is secure
// - can count secure phrases
```
{% endraw %}

I can now run against the test input

{% raw %}
```scala
import scala.io.Source
// import scala.io.Source

val input = Source.fromResource("day4input.txt").getLines().toSeq
// input: Seq[String] = Stream(sayndz zfxlkl attjtww cti sokkmty brx fhh suelqbp, ?)

countSecure(input)
// res1: Int = 383
```
{% endraw %}

## Part 2

For part two, the validator now needs to reject duplicate anagrams as well. This can be achieved by sorting each word
alphabetically, which reduces the problem to the same one solved in part one.

{% raw %}
```scala
def isReallySecure(passphrase: String): 
  Boolean = iterSecure(passphrase.split(" ").toList.map(s => s.sorted))
// isReallySecure: (passphrase: String)Boolean

def countReallySecure(passphrases: Seq[String]): 
  Int = passphrases.count(isReallySecure)
// countReallySecure: (passphrases: Seq[String])Int
```
{% endraw %}

There are some more test cases, and some of the previous ones can be reused with
slightly different answers

{% raw %}
```scala
class Day4Part2Test extends FunSuite with Matchers {
  test("can test a phrase is *really* secure") {

    isReallySecure("aa bb cc dd ee") shouldBe true
    isReallySecure("aa bb cc dd aa") shouldBe false
    isReallySecure("aa bb cc dd aaa") shouldBe true
    isReallySecure("ab") shouldBe true
    isReallySecure("ab ba") shouldBe false
    isReallySecure("a b") shouldBe true
    isReallySecure("a a") shouldBe false
    isReallySecure("a a a") shouldBe false


    isReallySecure("abcde fghij") shouldBe true
    isReallySecure("abcde xyz ecdab") shouldBe false
    isReallySecure("a ab abc abd abf abj") shouldBe true
    isReallySecure("iiii oiii ooii oooi oooo") shouldBe true
    isReallySecure("oiii ioii iioi iiio") shouldBe false


    isReallySecure("sayndz zfxlkl attjtww cti sokkmty brx fhh suelqbp") shouldBe true
    isReallySecure("xmuf znkhaes pggrlp zia znkhaes znkhaes") shouldBe false
    isReallySecure("nti rxr bogebb zdwrin") shouldBe true
    isReallySecure("sryookh unrudn zrkz jxhrdo gctlyz") shouldBe true
    isReallySecure("bssqn wbmdc rigc zketu ketichh enkixg bmdwc stnsdf jnz mqovwg ixgken") shouldBe false
    isReallySecure("flawt cpott xth ucwgg xce jcubx wvl qsysa nlg") shouldBe true
  }

  test("can count *really* secure phrases") {

    countReallySecure(Seq(
      "aa bb cc dd ee",
      "aa bb cc dd aa",
      "aa bb cc dd aaa",
      "ab",
      "ab ba",
      "a b",
      "a a",
      "a a a"
    )) shouldBe 4

    countReallySecure(Seq(
      "abcde fghij",
      "abcde xyz ecdab",
      "a ab abc abd abf abj",
      "iiii oiii ooii oooi oooo",
      "oiii ioii iioi iiio"
    )) shouldBe 3

    countReallySecure(Seq(
      "sayndz zfxlkl attjtww cti sokkmty brx fhh suelqbp",
      "xmuf znkhaes pggrlp zia znkhaes znkhaes",
      "nti rxr bogebb zdwrin",
      "sryookh unrudn zrkz jxhrdo gctlyz",
      "bssqn wbmdc rigc zketu ketichh enkixg bmdwc stnsdf jnz mqovwg ixgken",
      "flawt cpott xth ucwgg xce jcubx wvl qsysa nlg"
    )) shouldBe 4
  }
}
// defined class Day4Part2Test

(new Day4Part2Test).execute()
// Day4Part2Test:
// - can test a phrase is *really* secure
// - can count *really* secure phrases
```
{% endraw %}

All that is left is to run with the puzzle input

{% raw %}
```scala
countReallySecure(input)
// res3: Int = 265
```
{% endraw %}