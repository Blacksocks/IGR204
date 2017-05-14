#include <stdio.h>
#include <stdlib.h>

int main(int argc, char * argv[])
{
  if(argc != 4){
    printf("Usage: ./main input_file output_file ratio\n");
    return 1;
  }
  FILE * f_in = fopen(argv[1], "r");
  FILE * f_out = fopen(argv[2], "w");
  float ratio = strtof(argv[3], NULL);
  if(ratio <= 0 || ratio >= 1) {
    printf("ratio should be between O and 1 (exclusive)\n");
    return 1;
  }
  if(f_in == NULL){
    printf("[ERROR] Input file does not exists\n");
    return 1;
  }
  if(f_out == NULL){
    printf("[ERROR] Ouput file cannot be created\n");
    return 1;
  }
  int line_size = 1024;
  char * line = malloc(line_size);
  float count = 1;
  while(fgets(line, line_size, f_in) != NULL) {
    count += ratio;
    if(count < 1)
      continue;
    count = 0;
    fputs(line, f_out);
  }
  fclose(f_in);
  fclose(f_out);
  return 0;
}
