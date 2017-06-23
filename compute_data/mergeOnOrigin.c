#include <stdio.h>
#include <stdlib.h>
#include <math.h>

typedef int bool;
#define true 1
#define false 0

int getNumberDigit(int number)
{
  int res = -1;
  int loop = 1;
  while (res != 0)
  {
    res = number / pow(10, loop);
    loop++;
  }
  return loop -1;
}

void writeToFile(FILE *f, int race, int sex, int population, char buff[32])
{
  int number[8];
  int numberDigit = getNumberDigit(population);
  int iter = 0;
  for (int i = 0 ; i < 8 ; i++)
  {
    if (i < 8 - numberDigit) number[i] = 0;
    else
    {
      number[7-iter] = population % 10 ;
      population = population / 10;
      iter++;
    }
  }

  fprintf(f, "%c%c%c%c%c%c%c%c%c%c%c%d%d%d%d%d%d%d%d%d%d\n", buff[0], buff[1], buff[2], buff[3], buff[4], buff[5], buff[6], buff[7],
            buff[8], buff[9], buff[10], race, sex, number[0], number[1], number[2], number[3], number[4], number[5], number[6], number[7]);
}

int main()
{
  FILE *fptr;
  FILE *wr;
  char buff[32];
  char previous_buff[32];

  if ((fptr = fopen("../data/us_pop_merge_on_age.txt","r")) == NULL){
       printf("Error! opening file\n");

       // Program exits if the file pointer returns NULL.
       exit(1);
   }

   if ((wr = fopen("../data/us_pop_merge_on_age_and_origin.txt", "w")) == NULL) {
     printf("Error! opening file");

     exit(1);
   }

   int female_population, male_population = 0;
   int previous_race = 1;
   while (fscanf(fptr, "%s", buff) != EOF)
   {
     int race = buff[13] - '0';
     int sex = buff[15] - '0';
     if (race != previous_race)
     {
       writeToFile(wr, previous_race, 1, male_population, previous_buff);
       writeToFile(wr, previous_race, 2, female_population, previous_buff);
       male_population = 0;
       female_population = 0;
     }

     int population = 0;
     for (int i = 0 ; i < 8 ; i++) population += (buff[23-i] - '0') * pow(10,i);
     if (sex == 1) //male
     {
       male_population += population;
     }

     else //female
     {
       female_population += population;
     }

     previous_race = race;
     for (int i = 0 ; i < 32; i++)  previous_buff[i] = buff[i];


   }

   fclose(fptr);
   fclose(wr);
}
