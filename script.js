//The JavaScript code for perfect hashing assignment

//The dataset was taken from a Github account after searching on Google. There are lots of words missing, even some very common ones.
const dictionaryDatabaseLink = 'https://raw.githubusercontent.com/MinhasKamal/BengaliDictionary/master/BengaliDictionary.json';

const radix = 256;
const bigPrime = 908209935089;  //Here we've taken a large prime number for the sake of our hashing

var initialA = null;
var initialB = null;

var numberOfWords;
var dictionary;
var data;

//This is an array taken to choose a suitable prime number for the secondary hash function
const primeArray = [1, 2, 5, 11, 17, 29, 37, 53, 67];

//This is an array for temporarily keeping tha hash table
var tempHashTable = new Array();
var maxKey = -1;

var hashTable = new Array();

var hashtable1Indicator = new Array();
var hashTable2Indicator = new Array();

window.onload = function initializeHashing()
{
	console.log('Data Received');
    data = fetch(dictionaryDatabaseLink)
        .then(response => {
            if(!response.ok){
                throw new Error("HTTP error" + response.status);
            }
            return response.json()
        })
        .then(json => {
            dictionary = json;
        	numberOfWords = Object.keys(dictionary).length;
        })
        .then(response => {
        	for(var i = 0; i < numberOfWords; ++i)
			{
				/*Here the size of the row of the 2d hash table is taken as 80 because I've checked that the number of
				maximum collision that can happen at the primary level is 7. So I'll be safe with an array size of
				more than 7*7 or 49. So 80 is a pretty safe value.
				*/
				hashTable[i] = new Array(80).fill(null);
				tempHashTable[i] = new Array(80).fill(null);

				//We're filling the indicator of the secondary hash table with -1 to initialize it
				hashTable2Indicator[i] = new Array(10).fill(-1);
				hashTable[i][0] = null;
			}

			hashtable1Indicator = new Array(numberOfWords).fill(0);

			for(var i = 0; i < numberOfWords; ++i)
			{
				var word = dictionary[i].en.toLowerCase();
				var key = primaryHash(getKeyFromWord(word));
				maxKey = Math.max(key, maxKey);

				/*Here we are updating the hash table after performing the necessary calculations
				of the first or primary hash function.
				*/
				if(hashtable1Indicator[key] == 0)
				{
					hashTable[key][0] = dictionary[i];
					tempHashTable[key][0] = dictionary[i];
					hashtable1Indicator[key] = 1;
				}
				else
					tempHashTable[key][hashtable1Indicator[key]++] = dictionary[i];
			}

			//Debug purpose
			console.log('Max key ' + maxKey);

			/*This maximumColision variable is here for debugging. I needed to check
			the number of collision after the first/primary hash function.
			*/
			var maximumCollision = -1;
			for(var i = 0; i <= maxKey; ++i)
			{
				if(hashtable1Indicator[i] != 0)
					{
						/*Here we are updating the hash table after performing the
						necessary calculations of the secondary hash function.
						*/
						var result = secondaryHash(i, tempHashTable[i]);
						hashTable[i] = result[0];
						hashTable2Indicator[i] = result[1];
						maximumCollision =  Math.max(maximumCollision, hashtable1Indicator[i]);

						//Debugging purpose
						//console.log('hashTable2Indicator[c] '+ hashTable2Indicator[i][2]);
					}
			}

			//Debug purpose
			console.log('Collision = ' + maximumCollision);
        });
}

function getKeyFromWord(word)
{
        var val = 0;

        var a = Math.floor(Math.random() * (bigPrime - 1) ) + 1;
        var b = Math.floor(Math.random() * bigPrime);

		//Checking whether the values of a and b are initialized or not here
        if(initialA == null || initialB == null)
		{
            initialA = a;
            initialB = b;
        }
        else
		{
            a = initialA;
            b = initialB;
        }

		/*We are modding by bigPrime here because the val * radix value might
		surpass the highest limit of JavaScript. This might cause some extra
		collisions but the probability is extremely extremely low.
		*/
        for(var i = 0; i < word.length; ++i)
            val = ( (val * radix) % bigPrime + word.charCodeAt(i) ) % bigPrime;

        const aValB = BigInt(a * val + b);
        const keyFromWord = aValB % BigInt(bigPrime);

        return Number(keyFromWord);
}

function primaryHash(key)
{
	return key % numberOfWords;
}

function secondaryHash(key, tempHashArray)
{
	var flag = false;
	var finalArray;
	while(!flag)
	{
		finalArray = new Array(80).fill(null);

		//Debugging purpose
		console.log('Inside the while loop');

		//Here the a, b and key values are saved
		var secondaryHashArray = new Array(10).fill(-1);
		
		var a = BigInt(Math.floor(Math.random() * (bigPrime - 1) ) + 1);
		var b = BigInt(Math.floor(Math.random() * bigPrime));

		//Debug purpose
		console.log('Length of primary hash table: ' + hashtable1Indicator[key]);

		for(var i = 0; i < hashtable1Indicator[key]; ++i)
		{
			var pos = BigInt((a * BigInt(key) + b) % BigInt(primeArray[hashtable1Indicator[key]]));
			if(finalArray[pos] == null)
			{
				finalArray[pos] = tempHashArray[i];
				secondaryHashArray = [a, b , BigInt(primeArray[hashtable1Indicator[key]])];
				if(i + 1 == hashtable1Indicator[key]) flag = true;
			}
			else if(tempHashArray[i].en === finalArray[pos].en)
			{
				if(i + 1 == hashtable1Indicator[key]) flag = true;
				continue;
			}
			else break;
		}
		return[finalArray, secondaryHashArray];
	}
}

function search()
{
    var input = document.getElementById('query');
    var word = input.value.toLowerCase();
    var output1 = document.getElementById('output1');
	var output2 = document.getElementById('output2');
	var output3 = document.getElementById('output3');
	var output4 = document.getElementById('output4');
	var output5 = document.getElementById('output5');

	//Searching for the element at the first level
    var key = primaryHash(getKeyFromWord(word));
    var secHash;

    try{
		if(word == "")
		{
			output1.innerHTML = null;
			output2.innerHTML = null;
			output3.innerHTML = null;
			output4.innerHTML = null;
			output5.innerHTML = null;
			return;
		}
        if(hashtable1Indicator[key] == 0)
		{
            //throw 'Word Not Found';
			output1.innerHTML = "Word not found";
			output2.innerHTML = null;
			output3.innerHTML = null;
			output4.innerHTML = null;
			output5.innerHTML = null;
			return;
        }

        const a = hashTable2Indicator[key][0];
        const b = hashTable2Indicator[key][1];
        const c = hashTable2Indicator[key][2];

		//Searching for the element at the second level
        secHash = BigInt((a * BigInt(key) + b) % BigInt(primeArray[hashtable1Indicator[key]]));

        if(hashTable[key][secHash] != null && hashTable[key][secHash].en == word)
		{
            output1.innerHTML = "Pronunciation: " + hashTable[key][secHash].pron;
			output2.innerHTML = "Meaning: " + hashTable[key][secHash].bn;
			output3.innerHTML = "Bangla Synonyms: " + hashTable[key][secHash].bn_syns;
			output4.innerHTML = "English Synonyms: " + hashTable[key][secHash].en_syns;
			output5.innerHTML = "Use in Sentence: " + hashTable[key][secHash].sents;
        }
        else{
			//throw 'Word not found';
            output1.innerHTML = "Word not found";
			output2.innerHTML = null;
			output3.innerHTML = null;
			output4.innerHTML = null;
			output5.innerHTML = null;
			return;
        }
    }catch(err){
        console.log(err);
        output.innerHTML = '';
    };
}
